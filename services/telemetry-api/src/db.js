import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kasper_telemetry',
  user: 'kasper',
  password: 'kasper_dev_2026',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error', err);
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  return pool.connect();
}
