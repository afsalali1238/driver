import { useEffect, useRef, useState, useCallback } from 'react';

interface TripLocationUpdate {
  event: 'TRIP_LOCATION_UPDATE';
  data: {
    tripId: string;
    driverId: string;
    lat: number;
    lon: number;
    speedKmh: number;
    bearing: number;
    timestamp: number;
  };
}

interface TripStatusChange {
  event: 'TRIP_STATUS_CHANGE';
  data: {
    tripId: string;
    previousStatus: string;
    newStatus: string;
    timestamp: number;
  };
}

interface EpodSubmitted {
  event: 'EPOD_SUBMITTED';
  data: {
    tripId: string;
    receiverName: string;
    pdfUrl: string;
    timestamp: number;
  };
}

type FleetEvent = TripLocationUpdate | TripStatusChange | EpodSubmitted;

export function useFleetWebSocket(onEvent?: (event: FleetEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef<string | null>(null);
  const isClient = typeof window !== 'undefined';

  const connect = useCallback(() => {
    if (!isClient) return;
    
    const token = localStorage.getItem('ops_token');
    if (!token) return;
    
    tokenRef.current = token;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'}/ws/ops`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      // Authenticate
      ws.send(JSON.stringify({ type: 'auth', token }));
      // Subscribe to fleet updates
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'fleet' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'auth_ok') {
          console.log('WS auth OK');
        } else if (data.type === 'subscribed') {
          console.log('Subscribed to:', data.channel);
        } else if (onEvent) {
          onEvent(data);
        }
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [onEvent, isClient]);

  useEffect(() => {
    if (!isClient) return;
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect, isClient]);

  return { connected };
}