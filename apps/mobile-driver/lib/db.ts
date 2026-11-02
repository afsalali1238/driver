import { openDatabaseSync } from 'expo-sqlite';

export const db = openDatabaseSync('kasper_offline.db');

// Initialize tables
export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_breadcrumbs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      speed REAL NOT NULL DEFAULT 0,
      bearing REAL NOT NULL DEFAULT 0,
      accuracy REAL NOT NULL DEFAULT 0,
      altitude REAL,
      battery_level INTEGER,
      recorded_at INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
  
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
  
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_breadcrumbs_trip_time ON offline_breadcrumbs(trip_id, recorded_at DESC);
  `);
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_events_trip ON offline_events(trip_id);
  `);
}

export function queueBreadcrumb(breadcrumb: {
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  accuracy: number;
  altitude?: number;
  batteryLevel?: number;
  recordedAt: number;
}) {
  db.runSync(
    `INSERT INTO offline_breadcrumbs (trip_id, latitude, longitude, speed, bearing, accuracy, altitude, battery_level, recorded_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      breadcrumb.tripId,
      breadcrumb.latitude,
      breadcrumb.longitude,
      breadcrumb.speed,
      breadcrumb.bearing,
      breadcrumb.accuracy,
      breadcrumb.altitude ?? null,
      breadcrumb.batteryLevel ?? null,
      breadcrumb.recordedAt,
    ]
  );
}

export function queueEvent(tripId: string, eventType: string, payload: any) {
  db.runSync(
    `INSERT INTO offline_events (trip_id, event_type, payload_json, synced) VALUES (?, ?, ?, 0)`,
    [tripId, eventType, JSON.stringify(payload)]
  );
}

export function getUnsyncedBreadcrumbs(limit = 50) {
  return db.getAllSync(`SELECT * FROM offline_breadcrumbs WHERE synced = 0 ORDER BY recorded_at ASC LIMIT ?`, [limit]);
}

export function getUnsyncedEvents(limit = 20) {
  return db.getAllSync(`SELECT * FROM offline_events WHERE synced = 0 ORDER BY id ASC LIMIT ?`, [limit]);
}

export function markBreadcrumbsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.runSync(`UPDATE offline_breadcrumbs SET synced = 1 WHERE id IN (${placeholders})`, ids);
}

export function markEventsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.runSync(`UPDATE offline_events SET synced = 1 WHERE id IN (${placeholders})`, ids);
}

export function clearSyncedData(olderThanDays = 7) {
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  db.runSync(`DELETE FROM offline_breadcrumbs WHERE synced = 1 AND recorded_at < ?`, [cutoff]);
  db.runSync(`DELETE FROM offline_events WHERE synced = 1 AND id IN (SELECT id FROM offline_events WHERE synced = 1 AND id < (SELECT MAX(id) FROM offline_events) - 1000)`);
}

export default db;
