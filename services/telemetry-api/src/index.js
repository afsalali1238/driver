import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { pool } from './db.js';
import { redis } from './redis.js';
import { wss, startRedisSubscription } from './ws.js';
import driverRoutes from './routes/driver.js';
import adminRoutes from './routes/admin.js';
import opsRoutes from './routes/ops.js';
import publicRoutes from './routes/public.js';

config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configured to allow Ops Admin (3000), Customer Tracking (3001), Expo Web/Mobile (8081), etc.
app.use(cors({
  origin: (origin, callback) => {
    // Permissive for development and prototype demonstration
    callback(null, true);
  },
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/driver', driverRoutes);
app.use('/api/v1/ops', adminRoutes);
app.use('/api/v1/ops', opsRoutes);
app.use('/api/v1/public', publicRoutes);

// WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  if (pathname === '/ws/ops' || pathname === '/ws/driver') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await pool.end();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function start() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connected');
    
    // Test Redis connection
    await redis.ping();
    console.log('Redis connected');
    
    // Start Redis subscription for WebSocket events
    await startRedisSubscription();
    
    server.listen(PORT, () => {
      console.log(`Telemetry API running on port ${PORT}`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws/ops`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();
