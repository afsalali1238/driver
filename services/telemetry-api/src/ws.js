import { WebSocketServer } from 'ws';
import { redis } from './redis.js';
import { verifyToken } from './auth.js';

const wss = new WebSocketServer({ noServer: true });

const clients = new Map(); // ws -> { user, subscriptions }

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === 'auth') {
        const decoded = verifyToken(msg.token);
        if (!decoded) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
          ws.close();
          return;
        }
        clients.set(ws, { user: decoded, subscriptions: new Set() });
        ws.send(JSON.stringify({ type: 'auth_ok', user: decoded }));
      } else if (msg.type === 'subscribe') {
        const client = clients.get(ws);
        if (!client) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }
        if (msg.channel === 'fleet' && ['ops_admin', 'admin'].includes(client.user.role)) {
          client.subscriptions.add('fleet');
          ws.send(JSON.stringify({ type: 'subscribed', channel: 'fleet' }));
        } else if (msg.channel === 'trip' && msg.tripId) {
          client.subscriptions.add(`trip:${msg.tripId}`);
          ws.send(JSON.stringify({ type: 'subscribed', channel: `trip:${msg.tripId}` }));
        }
      }
    } catch (e) {
      console.error('WS message error:', e);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket disconnected');
  });

  ws.on('error', (err) => {
    console.error('WS error:', err);
    clients.delete(ws);
  });
});

// Heartbeat
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      clients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Subscribe to Redis pub/sub and broadcast to WebSocket clients
async function startRedisSubscription() {
  const subscriber = redis.duplicate();
  await subscriber.subscribe('trip_events', (err) => {
    if (err) console.error('Redis subscribe error:', err);
  });

  subscriber.on('message', (channel, message) => {
    if (channel !== 'trip_events') return;
    
    try {
      const event = JSON.parse(message);
      broadcastEvent(event);
    } catch (e) {
      console.error('Redis message parse error:', e);
    }
  });

  console.log('Subscribed to trip_events channel');
}

function broadcastEvent(event) {
  const payload = JSON.stringify(event);
  
  clients.forEach((client, ws) => {
    if (ws.readyState !== 1) return; // not OPEN
    
    // Check if client should receive this event
    if (event.event === 'TRIP_LOCATION_UPDATE' || event.event === 'TRIP_STATUS_CHANGE') {
      if (client.subscriptions.has('fleet') || client.subscriptions.has(`trip:${event.data.tripId}`)) {
        ws.send(payload);
      }
    } else if (event.event === 'EPOD_SUBMITTED') {
      if (client.subscriptions.has('fleet') || client.subscriptions.has(`trip:${event.data.tripId}`)) {
        ws.send(payload);
      }
    }
  });
}

export { wss, startRedisSubscription };
