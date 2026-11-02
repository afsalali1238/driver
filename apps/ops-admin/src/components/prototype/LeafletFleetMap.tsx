'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TripData } from '../../data/dummyData';

interface LeafletFleetMapProps {
  trips: TripData[];
  selectedTripId?: string;
  onSelectTrip?: (trip: TripData) => void;
  theme?: 'light' | 'dark';
  mapType?: 'STREET' | 'SATELLITE';
}

// Controller to auto-fit bounds or pan to selected vehicle
function MapBoundsController({ 
  trips, 
  selectedTripId 
}: { 
  trips: TripData[]; 
  selectedTripId?: string; 
}) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (trips.length > 0 && !hasFittedRef.current) {
      const bounds = L.latLngBounds(trips.map(t => t.currentCoords));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
      hasFittedRef.current = true;
    }
  }, [trips, map]);

  useEffect(() => {
    if (!selectedTripId) return;
    const selected = trips.find(t => t.id === selectedTripId);
    if (selected) {
      map.flyTo(selected.currentCoords, 12, { duration: 0.8 });
    }
  }, [selectedTripId, trips, map]);

  return null;
}

// Custom DivIcon for Equipment vs Freight
function createVehicleIcon(trip: TripData, isSelected: boolean) {
  const isEquipment = trip.category === 'EQUIPMENT';
  const isMoving = trip.status === 'IN_TRANSIT';
  
  // Equipment: Amber / Gold palette. Freight: Cyan / Royal Blue palette
  const primaryColor = isEquipment ? '#D97706' : '#0284C7';
  const badgeBg = isEquipment ? '#FEF3C7' : '#E0F2FE';
  const badgeText = isEquipment ? '#92400E' : '#0369A1';
  const categoryIcon = isEquipment ? '🚜' : '📦';
  const categoryLabel = isEquipment ? 'EQUIPMENT' : 'FREIGHT';

  const html = `
    <div style="display:flex; flex-direction:column; align-items:center; pointer-events:auto; transform: translate(-50%, -100%);">
      <!-- Top Tag Badge -->
      <div style="
        background:${isSelected ? primaryColor : badgeBg};
        color:${isSelected ? '#FFFFFF' : badgeText};
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 6px;
        border: 1.5px solid ${primaryColor};
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        white-space: nowrap;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>${categoryIcon}</span>
        <span>${trip.vehiclePlate}</span>
        ${isMoving ? `<span style="background:${isSelected ? '#FFFFFF' : primaryColor}; color:${isSelected ? primaryColor : '#FFFFFF'}; padding:0 3px; border-radius:3px; font-size:9px;">${trip.speedKmh} km/h</span>` : ''}
      </div>

      <!-- Vehicle Pin Marker with Directional Heading Pointer -->
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${isSelected ? '#0F172A' : '#FFFFFF'};
        border: 3px solid ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      ">
        <span>${categoryIcon}</span>
        
        <!-- Directional Heading Pointer -->
        ${isMoving ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 14px;
            height: 14px;
            background: ${primaryColor};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${trip.headingDeg}deg);
          ">
            <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 6px solid #FFFFFF;"></div>
          </div>
        ` : ''}
      </div>

      <!-- Pin point arrow -->
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${primaryColor};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-fleet-marker',
    html,
    iconSize: [120, 60],
    iconAnchor: [60, 60],
  });
}

function createWaypointIcon(label: string, color: string) {
  const html = `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
      <div style="background:${color}; color:white; font-size:9px; font-weight:800; padding:1px 5px; border-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px;">
        ${label}
      </div>
      <div style="width:18px; height:18px; border-radius:50%; background:${color}; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-waypoint-marker',
    html,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
}

export default function LeafletFleetMap({
  trips,
  selectedTripId,
  onSelectTrip,
  theme = 'light',
  mapType = 'STREET'
}: LeafletFleetMapProps) {
  const isLight = theme === 'light';

  // Tile layers
  const streetTile = isLight
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const satelliteTile = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const tileUrl = mapType === 'SATELLITE' ? satelliteTile : streetTile;

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[24.7, 54.8]}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', background: isLight ? '#F1F5F9' : '#0B0F19' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
          maxZoom={19}
        />

        <MapBoundsController trips={trips} selectedTripId={selectedTripId} />

        {/* Selected Trip Route Trail & Destination Polyline */}
        {selectedTrip && (
          <>
            {/* Completed breadcrumb trail */}
            <Polyline
              positions={selectedTrip.routeTrail}
              pathOptions={{
                color: selectedTrip.category === 'EQUIPMENT' ? '#D97706' : '#0284C7',
                weight: 5,
                opacity: 0.9,
              }}
            />

            {/* Projected route towards destination */}
            <Polyline
              positions={[selectedTrip.currentCoords, selectedTrip.destinationCoords]}
              pathOptions={{
                color: selectedTrip.category === 'EQUIPMENT' ? '#F59E0B' : '#38BDF8',
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.7,
              }}
            />

            {/* Origin marker */}
            <Marker
              position={selectedTrip.originCoords}
              icon={createWaypointIcon('A: PICKUP YARD', '#059669')}
            >
              <Popup>
                <div className="text-xs font-sans">
                  <strong>Pickup Origin:</strong> {selectedTrip.originName}
                </div>
              </Popup>
            </Marker>

            {/* Destination marker */}
            <Marker
              position={selectedTrip.destinationCoords}
              icon={createWaypointIcon('B: PROJECT SITE', '#DC2626')}
            >
              <Popup>
                <div className="text-xs font-sans">
                  <strong>Delivery Site:</strong> {selectedTrip.destinationName}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Vehicle Markers */}
        {trips.map(trip => {
          const isSelected = trip.id === selectedTripId;
          return (
            <Marker
              key={trip.id}
              position={trip.currentCoords}
              icon={createVehicleIcon(trip, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectTrip) onSelectTrip(trip);
                }
              }}
            >
              <Popup>
                <div className="p-1 text-xs font-sans max-w-[220px]">
                  <div className="flex items-center justify-between font-mono font-bold mb-1">
                    <span className="text-amber-600">{trip.category === 'EQUIPMENT' ? '🚜 MACHINERY' : '📦 FREIGHT'}</span>
                    <span>{trip.vehiclePlate}</span>
                  </div>
                  <div className="font-bold text-slate-900 leading-snug mb-1">
                    {trip.cargoDescription}
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 border-t pt-1">
                    <div><strong>Driver:</strong> {trip.driverName}</div>
                    <div><strong>Speed:</strong> {trip.speedKmh} km/h • <strong>Battery:</strong> {trip.batteryPct}%</div>
                    <div><strong>Gross Weight:</strong> {trip.cargoWeightTon} Tons</div>
                    <div><strong>ETA:</strong> ~{trip.etaMinutes} mins ({trip.distanceRemainingKm} km)</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
