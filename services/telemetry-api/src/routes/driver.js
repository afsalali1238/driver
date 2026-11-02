import express from 'express';
import { query } from '../db.js';
import { redis } from '../redis.js';
import { authMiddleware } from '../auth.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// POST /api/v1/driver/auth/request-otp
router.post('/auth/request-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'phoneNumber required' });
    }

    // Check if driver exists
    const driverResult = await query('SELECT * FROM drivers WHERE phone_number = $1', [phoneNumber]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver not registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

    // In production, send via SMS/WhatsApp
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'Verification code dispatched',
      expiresInSeconds: 300,
    });
  } catch (e) {
    console.error('request-otp error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// POST /api/v1/driver/auth/verify-otp
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, deviceInfo } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, error: 'phoneNumber and otp required' });
    }

    const stored = otpStore.get(phoneNumber);
    if (!stored) {
      return res.status(400).json({ success: false, error: 'OTP expired or not requested' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      stored.attempts++;
      if (stored.attempts >= 3) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ success: false, error: 'Too many attempts' });
      }
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    otpStore.delete(phoneNumber);

    // Get driver
    const driverResult = await query('SELECT * FROM drivers WHERE phone_number = $1', [phoneNumber]);
    const driver = driverResult.rows[0];

    // Update device if provided
    if (deviceInfo?.deviceToken) {
      await query(
        `INSERT INTO driver_devices (driver_id, device_token, platform, device_model, os_version, app_version)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (driver_id, device_token) DO UPDATE SET
           platform = $3, device_model = $4, os_version = $5, app_version = $6, last_active_at = NOW()`,
        [driver.id, deviceInfo.deviceToken, deviceInfo.platform, deviceInfo.model, deviceInfo.osVersion, deviceInfo.appVersion]
      );
    }

    // Generate JWT
    const { generateToken } = await import('../auth.js');
    const token = generateToken({
      sub: driver.id,
      role: 'driver',
      phone: driver.phone_number,
    });

    res.json({
      token,
      driver: {
        id: driver.id,
        fullName: driver.full_name,
        phone: driver.phone_number,
        status: driver.status,
        assignedVehiclePlate: driver.assigned_vehicle_plate,
      },
    });
  } catch (e) {
    console.error('verify-otp error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// GET /api/v1/driver/trips/active
router.get('/trips/active', authMiddleware(['driver']), async (req, res) => {
  try {
    const driverId = req.user.sub;
    
    const result = await query(
      `SELECT t.*, d.full_name as driver_name, d.assigned_vehicle_plate
       FROM trips t
       JOIN drivers d ON t.driver_id = d.id
       WHERE t.driver_id = $1 AND t.status IN ('ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION')
       ORDER BY t.created_at DESC
       LIMIT 1`,
      [driverId]
    );

    if (result.rows.length === 0) {
      return res.json({ activeTrip: null });
    }

    const trip = result.rows[0];
    res.json({
      activeTrip: {
        id: trip.id,
        tripCode: trip.trip_code,
        status: trip.status,
        cargo: {
          title: trip.cargo_title,
          weightTons: trip.cargo_weight_tons,
          category: trip.cargo_category,
          notes: trip.cargo_notes,
        },
        origin: {
          address: trip.origin_address,
          latitude: trip.origin_lat,
          longitude: trip.origin_lon,
          contactName: trip.origin_contact_name,
          contactPhone: trip.origin_contact_phone,
        },
        destination: {
          address: trip.destination_address,
          latitude: trip.destination_lat,
          longitude: trip.destination_lon,
          contactName: trip.destination_contact_name,
          contactPhone: trip.destination_contact_phone,
        },
        customer: {
          companyName: trip.customer_name,
        },
        scheduledPickupTime: trip.scheduled_at,
      },
    });
  } catch (e) {
    console.error('active trips error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/v1/driver/trips/:tripId/status
router.post('/trips/:tripId/status', authMiddleware(['driver']), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status, latitude, longitude, remarks } = req.body;
    const driverId = req.user.sub;

    // Validate trip belongs to driver
    const tripCheck = await query('SELECT * FROM trips WHERE id = $1 AND driver_id = $2', [tripId, driverId]);
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const validTransitions = {
      ASSIGNED: ['EN_ROUTE_PICKUP'],
      EN_ROUTE_PICKUP: ['AT_PICKUP'],
      AT_PICKUP: ['IN_TRANSIT'],
      IN_TRANSIT: ['AT_DESTINATION'],
      AT_DESTINATION: ['COMPLETED'],
    };

    const currentStatus = tripCheck.rows[0].status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status transition from ${currentStatus} to ${status}` });
    }

    // Update trip status with timestamp
    const timestampCol = {
      EN_ROUTE_PICKUP: 'en_route_pickup_at',
      AT_PICKUP: 'at_pickup_at',
      IN_TRANSIT: 'in_transit_at',
      AT_DESTINATION: 'at_destination_at',
      COMPLETED: 'completed_at',
    }[status];

    const updates = ['status = $1', 'updated_at = NOW()'];
    const params = [status];
    let paramIdx = 2;

    if (timestampCol) {
      updates.push(`${timestampCol} = NOW()`);
    }
    if (latitude !== undefined) {
      updates.push(`origin_lat = $${paramIdx}`);
      params.push(latitude);
      paramIdx++;
    }
    if (longitude !== undefined) {
      updates.push(`origin_lon = $${paramIdx}`);
      params.push(longitude);
      paramIdx++;
    }

    params.push(tripId);
    await query(`UPDATE trips SET ${updates.join(', ')} WHERE id = $${paramIdx}`, params);

    // Publish status change event to Redis
    await redis.publish('trip_events', JSON.stringify({
      event: 'TRIP_STATUS_CHANGE',
      data: {
        tripId,
        previousStatus: currentStatus,
        newStatus: status,
        timestamp: Date.now(),
      },
    }));

    res.json({
      success: true,
      tripId,
      currentStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('update trip status error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// POST /api/v1/driver/telemetry/batch
router.post('/telemetry/batch', authMiddleware(['driver']), async (req, res) => {
  try {
    const { tripId, batteryPercentage, isCharging, samples } = req.body;
    const driverId = req.user.sub;

    // Verify trip belongs to driver and is active
    const tripCheck = await query(
      `SELECT id FROM trips WHERE id = $1 AND driver_id = $2 AND status IN ('EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION')`,
      [tripId, driverId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Active trip not found' });
    }

    // Insert breadcrumbs in batch
    const values = [];
    const placeholders = samples.map((s, i) => {
      const base = i * 10;
      values.push(tripId, driverId, s.latitude, s.longitude, s.speedKmh || 0, s.bearing || 0, s.accuracyMeters || 0);
      values.push(s.altitudeMeters || null);
      values.push(batteryPercentage || null);
      values.push(new Date(s.recordedAt));
      return `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10})`;
    }).join(',');

    await query(
      `INSERT INTO telemetry_breadcrumbs (trip_id, driver_id, latitude, longitude, speed_kmh, bearing, accuracy_meters, altitude_meters, battery_percentage, recorded_at)
       VALUES ${placeholders}`,
      values
    );

    // Get latest position for Redis cache and WebSocket
    const latest = samples[samples.length - 1];
    const fleetKey = `fleet:${tripId}`;
    await redis.hset(fleetKey, {
      lat: latest.latitude,
      lon: latest.longitude,
      speed: latest.speedKmh || 0,
      bearing: latest.bearing || 0,
      battery: batteryPercentage || 0,
      updated: Date.now(),
    });
    await redis.expire(fleetKey, 300); // 5 min TTL

    // Publish location update
    await redis.publish('trip_events', JSON.stringify({
      event: 'TRIP_LOCATION_UPDATE',
      data: {
        tripId,
        driverId,
        lat: latest.latitude,
        lon: latest.longitude,
        speedKmh: latest.speedKmh || 0,
        bearing: latest.bearing || 0,
        timestamp: latest.recordedAt,
      },
    }));

    res.json({
      success: true,
      processedPoints: samples.length,
      serverTimestamp: Date.now(),
    });
  } catch (e) {
    console.error('telemetry batch error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

// POST /api/v1/driver/trips/:tripId/epod
router.post('/trips/:tripId/epod', authMiddleware(['driver']), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { receiverName, receiverPhone, receiverDesignation, signatureImageBase64, inspectionPhotos, remarks } = req.body;
    const driverId = req.user.sub;

    // Verify trip belongs to driver and is at destination
    const tripCheck = await query(
      `SELECT * FROM trips WHERE id = $1 AND driver_id = $2 AND status = 'AT_DESTINATION'`,
      [tripId, driverId]
    );
    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Trip not found or not at destination' });
    }

    const trip = tripCheck.rows[0];

    // In production, upload signature to S3 and get URL
    const signatureUrl = `https://s3.kasper.ae/epod-vault/${trip.trip_code}-signature.png`;

    // Create ePOD record
    await query(
      `INSERT INTO epod_signatures (trip_id, driver_id, receiver_name, receiver_phone, receiver_designation, signature_image_url, signoff_latitude, signoff_longitude, remarks, generated_pdf_url, signed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [tripId, driverId, receiverName, receiverPhone, receiverDesignation, signatureUrl, trip.origin_lat, trip.origin_lon, remarks, `https://s3.kasper.ae/epod-vault/${trip.trip_code}-ePOD.pdf`]
    );

    // Update trip status to COMPLETED
    await query(
      `UPDATE trips SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [tripId]
    );

    // Publish ePOD submitted event
    await redis.publish('trip_events', JSON.stringify({
      event: 'EPOD_SUBMITTED',
      data: {
        tripId,
        receiverName,
        pdfUrl: `https://s3.kasper.ae/epod-vault/${trip.trip_code}-ePOD.pdf`,
        timestamp: Date.now(),
      },
    }));

    res.status(201).json({
      success: true,
      tripId,
      status: 'COMPLETED',
      consignmentNotePdfUrl: `https://s3.kasper.ae/epod-vault/${trip.trip_code}-ePOD.pdf`,
    });
  } catch (e) {
    console.error('epod submit error:', e);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

export default router;
