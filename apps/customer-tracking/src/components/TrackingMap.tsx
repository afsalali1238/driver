'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  livePosition: { latitude: number; longitude: number; speedKmh: number; bearing: number } | null;
  destination: { latitude: number; longitude: number; address: string };
  trail?: [number, number][];
}

function createTruckIcon(bearing: number) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="transform: rotate(${bearing}deg);" class="truck-marker animate-bounce-slow">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function createDestinationIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="truck-marker" style="transform: scale(0.8);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

export function TrackingMap({ livePosition, destination, trail = [] }: TrackingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    livePosition?.latitude || destination.latitude,
    livePosition?.longitude || destination.longitude,
  ]);

  // Auto-center map on live position when it updates
  useEffect(() => {
    if (livePosition) {
      setMapCenter([livePosition.latitude, livePosition.longitude]);
    }
  }, [livePosition]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Route trail */}
      {trail.length > 1 && (
        <Polyline
          positions={trail}
          color="#0ea5e9"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
      
      {/* Live truck position */}
      {livePosition && (
        <Marker position={[livePosition.latitude, livePosition.longitude]} icon={createTruckIcon(livePosition.bearing)}>
          <Popup offset={[0, -25]}>
            <div className="p-2 min-w-[180px]">
              <div className="font-bold text-gray-900">Your Shipment</div>
              <div className="text-sm text-gray-600 mt-1">{livePosition.speedKmh.toFixed(1)} km/h</div>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Destination marker */}
      <Marker position={[destination.latitude, destination.longitude]} icon={createDestinationIcon()}>
        <Popup offset={[0, -35]}>
          <div className="p-2 min-w-[200px]">
            <div className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Destination
            </div>
            <div className="text-sm text-gray-600 mt-1">{destination.address}</div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}