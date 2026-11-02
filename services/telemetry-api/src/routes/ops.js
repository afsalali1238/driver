import express from 'express';
import { query } from '../db.js';
import { redis } from '../redis.js';
import { authMiddleware } from '../auth.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

// GET /api/v1/ops/trips
router.get('/trips', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramIdx = 1;

    if (status) {
      whereClause = `WHERE t.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    params.push(limit, offset);

    const tripsResult = await query(
      `SELECT t.*, d.full_name as driver_name, d.phone_number as driver_phone, d.assigned_vehicle_plate
       FROM trips t
       LEFT JOIN drivers d ON t.driver_id = d.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM trips t ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      trips: tripsResult.rows.map(t => ({
        id: t.id,
        tripCode: t.trip_code,
        status: t.status,
        cargoTitle: t.cargo_title,
        cargoWeightTons: t.cargo_weight_tons,
        cargoCategory: t.cargo_category,
        originAddress: t.origin_address,
        originLat: t.origin_lat,
        originLon: t.origin_lon,
        destinationAddress: t.destination_address,
        destinationLat: t.destination_lat,
        destinationLon: t.destination_lon,
        customerName: t.customer_name,
        customerPhone: t.customer_phone,
        trackingToken: t.tracking_token,
        driverId: t.driver_id,
        driverName: t.driver_name,
        driverPhone: t.driver_phone,
        vehiclePlate: t.assigned_vehicle_plate,
        scheduledAt: t.scheduled_at,
        createdAt: t.created_at,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (e) {
    console.error('list trips error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/v1/ops/trips
router.post('/trips', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  try {
    const {
      customerName, customerPhone, cargoTitle, cargoWeightTons, cargoCategory, cargoNotes,
      originAddress, originLat, originLon, originContactName, originContactPhone,
      destinationAddress, destinationLat, destinationLon, destinationContactName, destinationContactPhone,
      driverId, scheduledAt,
    } = req.body;

    const tripCode = `KSP-TR-${Date.now().toString().slice(-6)}`;
    const trackingToken = crypto.randomBytes(16).toString('hex');

    const result = await query(
      `INSERT INTO trips (
        trip_code, status, driver_id, cargo_title, cargo_weight_tons, cargo_category, cargo_notes,
        origin_address, origin_lat, origin_lon, origin_contact_name, origin_contact_phone,
        destination_address, destination_lat, destination_lon, destination_contact_name, destination_contact_phone,
        customer_name, customer_phone, tracking_token, scheduled_at
      ) VALUES ($1, 'DRAFT', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [tripCode, driverId || null, cargoTitle, cargoWeightTons, cargoCategory, cargoNotes,
       originAddress, originLat, originLon, originContactName, originContactPhone,
       destinationAddress, destinationLat, destinationLon, destinationContactName, destinationContactPhone,
       customerName, customerPhone, trackingToken, scheduledAt || null]
    );

    const trip = result.rows[0];

    // If driver assigned, update status to ASSIGNED and notify
    if (driverId) {
      await query(`UPDATE trips SET status = 'ASSIGNED', accepted_at = NOW() WHERE id = $1`, [trip.id]);
      await query(`UPDATE drivers SET status = 'ON_TRIP' WHERE id = $1`, [driverId]);
      
      await redis.publish('trip_events', JSON.stringify({
        event: 'TRIP_STATUS_CHANGE',
        data: {
          tripId: trip.id,
          previousStatus: 'DRAFT',
          newStatus: 'ASSIGNED',
          timestamp: Date.now(),
        },
      }));
    }

    res.status(201).json({
      success: true,
      trip: {
        id: trip.id,
        tripCode: trip.trip_code,
        status: trip.status,
        trackingToken: trip.tracking_token,
      },
    });
  } catch (e) {
    console.error('create trip error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// GET /api/v1/ops/fleet/live-positions (Returns ALL vehicles in fleet: active, assigned, and available)
router.get('/fleet/live-positions', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT ON (d.id)
        d.id AS driver_id,
        d.full_name AS driver_name,
        d.phone_number AS driver_phone,
        d.assigned_vehicle_plate AS vehicle_plate,
        d.vehicle_category,
        d.status AS driver_status,
        t.id AS trip_id,
        t.trip_code,
        t.status AS trip_status,
        t.cargo_title,
        t.customer_name,
        t.customer_phone,
        t.tracking_token,
        t.origin_address,
        t.origin_lat,
        t.origin_lon,
        t.destination_address,
        t.destination_lat,
        t.destination_lon,
        COALESCE(b.latitude, t.origin_lat, 25.3110) AS latitude,
        COALESCE(b.longitude, t.origin_lon, 55.4020) AS longitude,
        COALESCE(b.speed_kmh, 0.0) AS speed_kmh,
        COALESCE(b.bearing, 0.0) AS bearing,
        COALESCE(b.battery_percentage, 100) AS battery_percentage,
        b.recorded_at AS last_ping_time,
        COALESCE(EXTRACT(EPOCH FROM (NOW() - b.recorded_at)), 999999) AS seconds_since_last_ping,
        CASE 
            WHEN b.recorded_at IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - b.recorded_at)) < 90 THEN 'LIVE'
            WHEN b.recorded_at IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - b.recorded_at)) < 300 THEN 'DELAYED'
            ELSE 'OFFLINE'
        END AS connection_health,
        dev.app_version,
        dev.device_model,
        CASE
            WHEN dev.id IS NOT NULL THEN 'COMPLIANT'
            ELSE 'PENDING_INSTALL'
        END AS app_compliance_status
      FROM drivers d
      LEFT JOIN trips t ON t.driver_id = d.id AND t.status IN ('ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION')
      LEFT JOIN telemetry_breadcrumbs b ON (b.trip_id = t.id OR b.driver_id = d.id)
      LEFT JOIN (
        SELECT DISTINCT ON (driver_id) id, driver_id, app_version, device_model
        FROM driver_devices
        ORDER BY driver_id, last_active_at DESC
      ) dev ON dev.driver_id = d.id
      ORDER BY d.id, b.recorded_at DESC NULLS LAST
    `);
    
    const fleet = result.rows.map(row => ({
      driverId: row.driver_id,
      driverName: row.driver_name,
      driverPhone: row.driver_phone,
      vehiclePlate: row.vehicle_plate,
      vehicleCategory: row.vehicle_category || 'Heavy Transport',
      driverStatus: row.driver_status,
      tripId: row.trip_id || `idle-${row.driver_id}`,
      tripCode: row.trip_code || 'IDLE (Yard)',
      tripStatus: row.trip_status || (row.driver_status === 'AVAILABLE' ? 'AVAILABLE' : 'IDLE'),
      cargoTitle: row.cargo_title,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      trackingToken: row.tracking_token,
      originAddress: row.origin_address,
      originLat: row.origin_lat ? parseFloat(row.origin_lat) : null,
      originLon: row.origin_lon ? parseFloat(row.origin_lon) : null,
      destinationAddress: row.destination_address,
      destinationLat: row.destination_lat ? parseFloat(row.destination_lat) : null,
      destinationLon: row.destination_lon ? parseFloat(row.destination_lon) : null,
      lat: parseFloat(row.latitude),
      lon: parseFloat(row.longitude),
      speedKmh: parseFloat(row.speed_kmh),
      bearing: parseFloat(row.bearing),
      batteryPercentage: parseInt(row.battery_percentage),
      lastPingAgeSeconds: Math.floor(row.seconds_since_last_ping),
      health: row.connection_health,
      appComplianceStatus: row.app_compliance_status,
      appVersion: row.app_version || 'v1.0.0',
      deviceModel: row.device_model || 'Android Terminal',
    }));

    res.json({ fleet });
  } catch (e) {
    console.error('live positions error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// GET /api/v1/ops/trips/:tripId/route-trail
router.get('/trips/:tripId/route-trail', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const result = await query(
      `SELECT latitude, longitude, speed_kmh, recorded_at
       FROM telemetry_breadcrumbs
       WHERE trip_id = $1
       ORDER BY recorded_at ASC`,
      [tripId]
    );

    const coordinates = result.rows.map(r => [
      r.latitude,
      r.longitude,
      r.speed_kmh,
      new Date(r.recorded_at).getTime(),
    ]);

    res.json({
      tripId,
      totalPoints: coordinates.length,
      coordinates,
    });
  } catch (e) {
    console.error('route trail error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// GET /api/v1/ops/drivers
router.get('/drivers', authMiddleware(['ops_admin', 'admin']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json({ drivers: result.rows });
  } catch (e) {
    console.error('list drivers error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/v1/ops/drivers
router.post('/drivers', authMiddleware(['admin']), async (req, res) => {
  try {
    const { phoneNumber, fullName, licenseNumber, assignedVehiclePlate, vehicleCategory, preferredLanguage } = req.body;
    
    const result = await query(
      `INSERT INTO drivers (phone_number, full_name, license_number, assigned_vehicle_plate, vehicle_category, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [phoneNumber, fullName, licenseNumber, assignedVehiclePlate, vehicleCategory, preferredLanguage || 'en']
    );

    res.status(201).json({ success: true, driver: result.rows[0] });
  } catch (e) {
    console.error('create driver error:', e);
    if (e.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
