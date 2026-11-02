import express from 'express';
import { query } from '../db.js';
import { redis } from '../redis.js';

const router = express.Router();

// GET /api/v1/public/track/:trackingToken
router.get('/track/:trackingToken', async (req, res) => {
  try {
    const { trackingToken } = req.params;

    const result = await query(
      `SELECT t.*, d.full_name as driver_name, d.assigned_vehicle_plate
       FROM trips t
       LEFT JOIN drivers d ON t.driver_id = d.id
       WHERE t.tracking_token = $1`,
      [trackingToken]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tracking link not found or expired' });
    }

    const trip = result.rows[0];

    // Check if tracking link expired
    if (trip.tracking_link_expires_at && new Date(trip.tracking_link_expires_at) < new Date()) {
      return res.status(410).json({ error: 'Tracking link has expired' });
    }

    // Get latest position from Redis cache or fallback to telemetry_breadcrumbs
    let livePosition = null;
    const fleetKey = `fleet:${trip.id}`;
    const cached = await redis.hgetall(fleetKey);
    if (cached && Object.keys(cached).length > 0) {
      livePosition = {
        latitude: parseFloat(cached.lat),
        longitude: parseFloat(cached.lon),
        speedKmh: parseFloat(cached.speed),
        bearing: parseFloat(cached.bearing),
        updatedAt: new Date(parseInt(cached.updated)).toISOString(),
      };
    } else {
      const breadcrumbResult = await query(
        `SELECT latitude, longitude, speed_kmh, bearing, recorded_at
         FROM telemetry_breadcrumbs
         WHERE trip_id = $1
         ORDER BY recorded_at DESC
         LIMIT 1`,
        [trip.id]
      );
      if (breadcrumbResult.rows.length > 0) {
        const b = breadcrumbResult.rows[0];
        livePosition = {
          latitude: parseFloat(b.latitude),
          longitude: parseFloat(b.longitude),
          speedKmh: parseFloat(b.speed_kmh),
          bearing: parseFloat(b.bearing),
          updatedAt: new Date(b.recorded_at).toISOString(),
        };
      }
    }

    // Calculate ETA
    let eta = null;
    if (livePosition) {
      // Simple ETA: distance / speed
      const R = 6371; // km
      const dLat = (trip.destination_lat - livePosition.latitude) * Math.PI / 180;
      const dLon = (trip.destination_lon - livePosition.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(livePosition.latitude * Math.PI / 180) * Math.cos(trip.destination_lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;
      
      const speed = Math.max(livePosition.speedKmh, 1); // avoid div by zero
      const durationMinutes = Math.round((distanceKm / speed) * 60);
      const estimatedArrival = new Date(Date.now() + durationMinutes * 60 * 1000);
      
      eta = {
        remainingDistanceKm: Math.round(distanceKm * 10) / 10,
        estimatedDurationMinutes: durationMinutes,
        estimatedArrival: estimatedArrival.toISOString(),
      };
    }

    // Status label mapping
    const statusLabels = {
      'DRAFT': 'Not Started',
      'ASSIGNED': 'Assigned to Driver',
      'EN_ROUTE_PICKUP': 'En Route to Pickup',
      'AT_PICKUP': 'At Pickup Location',
      'IN_TRANSIT': 'In Transit to Site',
      'AT_DESTINATION': 'Arrived at Site',
      'COMPLETED': 'Delivered',
      'CANCELLED': 'Cancelled',
    };

    res.json({
      trackingToken: trip.tracking_token,
      tripCode: trip.trip_code,
      status: trip.status,
      statusLabel: statusLabels[trip.status] || trip.status,
      cargo: {
        title: trip.cargo_title,
        category: trip.cargo_category || 'Heavy Equipment Transport',
      },
      origin: {
        address: trip.origin_address,
      },
      destination: {
        address: trip.destination_address,
        latitude: trip.destination_lat,
        longitude: trip.destination_lon,
      },
      livePosition,
      eta,
      supportContact: {
        phone: '+9714800KASPER',
        whatsapp: '+971****2233',
      },
    });
  } catch (e) {
    console.error('public track error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
