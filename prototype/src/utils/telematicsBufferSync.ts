/**
 * Telematics Buffer & Monotonic FIFO Sync Routine
 * Designed for Expo SDK 52 React Native + Node 22 Telemetry Ingestion
 * 
 * Features:
 * 1. HDOP & GPS Jitter Filter (rejects hdop > 4.0 or horizontal accuracy > 35m)
 * 2. Speed Jump / Teleportation Guard (rejects instant velocity > 140 km/h)
 * 3. Strict Monotonic Timestamp Sequencer (recorded_at ASC)
 * 4. Multi-Tier Geofencing (Terminal Queue Demurrage vs Inner Offload Bay)
 * 5. Idempotent FIFO Batch Sync
 */

export interface RawLocationFix {
  id?: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  accuracyMeters: number;
  hdop?: number;
  batteryPct?: number;
  recordedAt: string; // ISO 8601
}

export interface SanitizedLocationPoint {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  accuracyMeters: number;
  recordedAt: string;
  geofenceTier?: 'OUTER_TERMINAL_QUEUE' | 'INNER_OFFLOAD_BAY' | 'EN_ROUTE';
  synced: boolean;
}

export interface MultiTierGeofence {
  name: string;
  center: [number, number]; // [lat, lng]
  outerRadiusMeters: number; // e.g. 1500m (demurrage clock starts)
  innerRadiusMeters: number; // e.g. 200m (site arrival / crane offload)
}

// Key UAE Port & Industrial Geofences
export const UAE_GEOFENCES: MultiTierGeofence[] = [
  {
    name: 'JAFZA Gate 4 Holding & Port',
    center: [24.9857, 55.0743],
    outerRadiusMeters: 2000,
    innerRadiusMeters: 250
  },
  {
    name: 'Khalifa Port Container Terminal',
    center: [24.8482, 54.7212],
    outerRadiusMeters: 2500,
    innerRadiusMeters: 300
  },
  {
    name: 'Ruwais ADNOC Complex',
    center: [24.1102, 52.7305],
    outerRadiusMeters: 3000,
    innerRadiusMeters: 400
  }
];

/**
 * Calculates Great Circle Haversine Distance in meters
 */
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates whether a coordinate fix falls into Outer Demurrage or Inner Offload geofence
 */
export function evaluateMultiTierGeofence(
  lat: number,
  lng: number,
  geofences: MultiTierGeofence[] = UAE_GEOFENCES
): { zoneName: string; tier: 'OUTER_TERMINAL_QUEUE' | 'INNER_OFFLOAD_BAY' | 'EN_ROUTE' } {
  for (const fence of geofences) {
    const dist = haversineDistanceMeters(lat, lng, fence.center[0], fence.center[1]);
    if (dist <= fence.innerRadiusMeters) {
      return { zoneName: fence.name, tier: 'INNER_OFFLOAD_BAY' };
    }
    if (dist <= fence.outerRadiusMeters) {
      return { zoneName: fence.name, tier: 'OUTER_TERMINAL_QUEUE' };
    }
  }
  return { zoneName: 'Open Highway', tier: 'EN_ROUTE' };
}

/**
 * High-Precision Telematics Filter
 * Discards multipath GPS reflections, urban canyon jitter, and timestamp reversal
 */
export class TelematicsBufferQueue {
  private buffer: SanitizedLocationPoint[] = [];
  private lastAcceptedPoint: SanitizedLocationPoint | null = null;

  /**
   * Evaluates raw fix. Returns point if accepted, or null with reason if rejected.
   */
  public ingest(raw: RawLocationFix): { accepted: boolean; point?: SanitizedLocationPoint; reason?: string } {
    // 1. Accuracy & HDOP Filter
    if (raw.hdop && raw.hdop > 4.0) {
      return { accepted: false, reason: `HDOP too high (${raw.hdop.toFixed(1)} > 4.0)` };
    }
    if (raw.accuracyMeters > 35) {
      return { accepted: false, reason: `Horizontal accuracy too wide (${raw.accuracyMeters}m > 35m)` };
    }

    // 2. Velocity Limit Filter
    if (raw.speedKmh > 140) {
      return { accepted: false, reason: `Speed exceedance (${raw.speedKmh} km/h > 140 km/h)` };
    }

    // 3. Monotonic Timestamp Check
    const pointTime = new Date(raw.recordedAt).getTime();
    if (this.lastAcceptedPoint) {
      const prevTime = new Date(this.lastAcceptedPoint.recordedAt).getTime();
      if (pointTime <= prevTime) {
        return { accepted: false, reason: 'Non-monotonic timestamp (clock skew or out-of-order packet)' };
      }

      // 4. Distance Jump Teleportation Filter
      const deltaSec = (pointTime - prevTime) / 1000;
      const distMeters = haversineDistanceMeters(
        this.lastAcceptedPoint.latitude,
        this.lastAcceptedPoint.longitude,
        raw.latitude,
        raw.longitude
      );
      const calculatedSpeedKmh = (distMeters / deltaSec) * 3.6;

      if (calculatedSpeedKmh > 140 && deltaSec < 30) {
        return {
          accepted: false,
          reason: `Implausible jump (${distMeters.toFixed(0)}m in ${deltaSec.toFixed(1)}s = ${calculatedSpeedKmh.toFixed(0)} km/h)`
        };
      }
    }

    // 5. Geofence Evaluation
    const { tier } = evaluateMultiTierGeofence(raw.latitude, raw.longitude);

    const sanitized: SanitizedLocationPoint = {
      id: raw.id || `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tripId: raw.tripId,
      latitude: raw.latitude,
      longitude: raw.longitude,
      speedKmh: Math.round(raw.speedKmh),
      headingDeg: Math.round(raw.headingDeg),
      accuracyMeters: Math.round(raw.accuracyMeters),
      recordedAt: raw.recordedAt,
      geofenceTier: tier,
      synced: false
    };

    this.lastAcceptedPoint = sanitized;
    this.buffer.push(sanitized);

    return { accepted: true, point: sanitized };
  }

  /**
   * Retrieves pending unsynced points in FIFO order
   */
  public getPendingBatch(batchSize: number = 25): SanitizedLocationPoint[] {
    return this.buffer.filter(p => !p.synced).slice(0, batchSize);
  }

  /**
   * Marks batch as successfully synced to remote endpoint
   */
  public markBatchSynced(pointIds: string[]): void {
    const idSet = new Set(pointIds);
    this.buffer = this.buffer.map(p => (idSet.has(p.id) ? { ...p, synced: true } : p));
  }

  /**
   * Clears old synced records
   */
  public purgeSynced(): number {
    const beforeCount = this.buffer.length;
    this.buffer = this.buffer.filter(p => !p.synced);
    return beforeCount - this.buffer.length;
  }

  public getQueueLength(): { pending: number; total: number } {
    const pending = this.buffer.filter(p => !p.synced).length;
    return { pending, total: this.buffer.length };
  }
}
