/**
 * Mobile Driver App - Telematics Buffer Service (Expo SDK 52)
 * Handles offline SQLite location buffering, HDOP jitter filtration, and FIFO server sync
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
  recordedAt: string;
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

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class TelematicsBufferQueue {
  private buffer: SanitizedLocationPoint[] = [];
  private lastAcceptedPoint: SanitizedLocationPoint | null = null;

  public ingest(raw: RawLocationFix): { accepted: boolean; point?: SanitizedLocationPoint; reason?: string } {
    if (raw.hdop && raw.hdop > 4.0) {
      return { accepted: false, reason: `HDOP too high (${raw.hdop.toFixed(1)} > 4.0)` };
    }
    if (raw.accuracyMeters > 35) {
      return { accepted: false, reason: `Horizontal accuracy too wide (${raw.accuracyMeters}m > 35m)` };
    }
    if (raw.speedKmh > 140) {
      return { accepted: false, reason: `Speed exceedance (${raw.speedKmh} km/h > 140 km/h)` };
    }

    const pointTime = new Date(raw.recordedAt).getTime();
    if (this.lastAcceptedPoint) {
      const prevTime = new Date(this.lastAcceptedPoint.recordedAt).getTime();
      if (pointTime <= prevTime) {
        return { accepted: false, reason: 'Non-monotonic timestamp' };
      }

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
          reason: `Implausible jump (${distMeters.toFixed(0)}m in ${deltaSec.toFixed(1)}s)`
        };
      }
    }

    const sanitized: SanitizedLocationPoint = {
      id: raw.id || `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tripId: raw.tripId,
      latitude: raw.latitude,
      longitude: raw.longitude,
      speedKmh: Math.round(raw.speedKmh),
      headingDeg: Math.round(raw.headingDeg),
      accuracyMeters: Math.round(raw.accuracyMeters),
      recordedAt: raw.recordedAt,
      geofenceTier: 'EN_ROUTE',
      synced: false
    };

    this.lastAcceptedPoint = sanitized;
    this.buffer.push(sanitized);

    return { accepted: true, point: sanitized };
  }

  public getPendingBatch(batchSize: number = 25): SanitizedLocationPoint[] {
    return this.buffer.filter(p => !p.synced).slice(0, batchSize);
  }

  public markBatchSynced(pointIds: string[]): void {
    const idSet = new Set(pointIds);
    this.buffer = this.buffer.map(p => (idSet.has(p.id) ? { ...p, synced: true } : p));
  }
}
