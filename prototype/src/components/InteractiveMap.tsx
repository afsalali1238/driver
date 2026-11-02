'use client';

import React from 'react';
import { TripData } from '../data/dummyData';
import { Navigation, MapPin, Truck, AlertCircle } from './Icons';

interface InteractiveMapProps {
  trips: TripData[];
  selectedTripId?: string;
  onSelectTrip?: (trip: TripData) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

// UAE geographic bounding box for SVG projection
// Lat: 23.8 to 26.0 (North)
// Lng: 52.5 to 56.5 (East)
function projectCoords(lat: number, lng: number, width: number, height: number): [number, number] {
  const minLat = 23.8;
  const maxLat = 26.0;
  const minLng = 52.5;
  const maxLng = 56.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  // Invert Y for SVG coordinates
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

export default function InteractiveMap({ 
  trips, 
  selectedTripId, 
  onSelectTrip, 
  className = '',
  theme = 'light' 
}: InteractiveMapProps) {
  const mapWidth = 900;
  const mapHeight = 520;
  const isLight = theme === 'light';

  // UAE key reference landmarks
  const landmarks = [
    { name: 'Abu Dhabi', coords: [24.4539, 54.3773] as [number, number] },
    { name: 'Dubai', coords: [25.2048, 55.2708] as [number, number] },
    { name: 'Sharjah', coords: [25.3463, 55.4209] as [number, number] },
    { name: 'Jebel Ali Port', coords: [25.0050, 55.0600] as [number, number] },
    { name: 'Al Ain', coords: [24.2075, 55.7447] as [number, number] },
    { name: 'Ruwais', coords: [24.1102, 52.7305] as [number, number] },
  ];

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-xl flex flex-col transition-colors ${
      isLight 
        ? 'bg-slate-50 border-slate-200 shadow-slate-200/60' 
        : 'bg-[#0B0F19] border-slate-800 shadow-2xl'
    } ${className}`}>
      
      {/* Top Map Bar */}
      <div className={`absolute top-3 left-3 z-10 flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-xl border text-xs shadow-sm ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800'
          : 'bg-slate-900/90 border-slate-700/60 text-slate-300'
      }`}>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-bold tracking-wide">UAE HEAVY CORRIDOR TELEMETRICS</span>
        <span className="text-slate-400">|</span>
        <span className="text-amber-600 font-mono font-bold">E11 / E311 / E611 ACTIVE</span>
      </div>

      <div className={`absolute top-3 right-3 z-10 flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-sm ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-700'
          : 'bg-slate-900/90 border-slate-700/60 text-slate-300'
      }`}>
        <span className="text-blue-600">FLEET ONLINE: {trips.filter(t => t.status === 'IN_TRANSIT').length} MOVING</span>
      </div>

      {/* SVG Vector Map Canvas */}
      <div className="relative w-full h-full flex items-center justify-center p-2">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-full object-contain select-none"
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke={isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.04)"} 
                strokeWidth="1" 
              />
            </pattern>
            {/* Pulsing gradient for active trucks */}
            <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width={mapWidth} height={mapHeight} fill={isLight ? "#F8FAFC" : "#0B0F19"} />
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

          {/* Persian Gulf Coastline */}
          <path
            d="M 20 220 Q 200 240 380 280 T 560 210 T 680 150 T 800 110 T 880 70"
            fill="none"
            stroke={isLight ? "rgba(2, 132, 199, 0.45)" : "rgba(56, 189, 248, 0.2)"}
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />
          <text 
            x="280" 
            y="160" 
            fill={isLight ? "rgba(2, 132, 199, 0.5)" : "rgba(56, 189, 248, 0.25)"} 
            fontSize="14" 
            fontWeight="700" 
            letterSpacing="4"
          >
            ARABIAN GULF (COASTAL FREIGHT CORRIDOR)
          </text>

          {/* Major UAE Highway Corridors */}
          {/* E11 Sheikh Zayed Road: Ruwais -> Abu Dhabi -> Dubai -> Sharjah */}
          <path
            d="M 60 410 Q 250 380 430 330 T 630 180 T 710 130"
            fill="none"
            stroke={isLight ? "rgba(100, 116, 139, 0.35)" : "rgba(148, 163, 184, 0.2)"}
            strokeWidth="4"
          />
          <text 
            x="510" 
            y="270" 
            fill={isLight ? "#475569" : "rgba(148, 163, 184, 0.3)"} 
            fontSize="10" 
            fontWeight="600"
            transform="rotate(-30 510 270)"
          >
            E11 SHEIKH ZAYED HIGHWAY
          </text>

          {/* E311 Sheikh Mohammed Bin Zayed Road */}
          <path
            d="M 470 360 Q 580 270 730 145"
            fill="none"
            stroke={isLight ? "rgba(100, 116, 139, 0.25)" : "rgba(148, 163, 184, 0.15)"}
            strokeWidth="3"
          />

          {/* Key Reference Cities */}
          {landmarks.map((landmark, idx) => {
            const [lx, ly] = projectCoords(landmark.coords[0], landmark.coords[1], mapWidth, mapHeight);
            return (
              <g key={idx} className="pointer-events-none">
                <circle cx={lx} cy={ly} r="3.5" fill={isLight ? "#475569" : "#64748B"} />
                <text 
                  x={lx + 6} 
                  y={ly + 4} 
                  fill={isLight ? "#334155" : "#94A3B8"} 
                  fontSize="11" 
                  fontWeight="700"
                >
                  {landmark.name}
                </text>
              </g>
            );
          })}

          {/* Route Trails for Trips */}
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const [ox, oy] = projectCoords(trip.originCoords[0], trip.originCoords[1], mapWidth, mapHeight);
            const [dx, dy] = projectCoords(trip.destinationCoords[0], trip.destinationCoords[1], mapWidth, mapHeight);

            const trailColor = isSelected ? '#D97706' : trip.status === 'IN_TRANSIT' ? '#2563EB' : '#94A3B8';

            return (
              <g key={`route-${trip.id}`}>
                {/* Full planned route line */}
                <line
                  x1={ox}
                  y1={oy}
                  x2={dx}
                  y2={dy}
                  stroke={trailColor}
                  strokeWidth={isSelected ? '3.5' : '1.8'}
                  strokeDasharray="5,4"
                  opacity={isSelected ? 0.95 : 0.4}
                />

                {/* Origin Marker */}
                <circle cx={ox} cy={oy} r="4.5" fill="#059669" />
                
                {/* Destination Marker */}
                <circle cx={dx} cy={dy} r="4.5" fill="#DC2626" />
              </g>
            );
          })}

          {/* Active Vehicles Markers */}
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const [cx, cy] = projectCoords(trip.currentCoords[0], trip.currentCoords[1], mapWidth, mapHeight);
            const isMoving = trip.status === 'IN_TRANSIT';

            return (
              <g
                key={`truck-${trip.id}`}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => onSelectTrip && onSelectTrip(trip)}
              >
                {/* Pulsing beacon if moving */}
                {isMoving && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 22 : 14}
                    fill={isSelected ? '#F59E0B' : '#3B82F6'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                {/* Vehicle Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 14 : 10}
                  fill={isSelected ? '#F59E0B' : isMoving ? '#2563EB' : '#64748B'}
                  stroke={isLight ? '#FFFFFF' : '#0F172A'}
                  strokeWidth="2.5"
                  className="filter drop-shadow-md"
                />

                {/* Directional arrow icon */}
                <g transform={`translate(${cx}, ${cy}) rotate(${trip.headingDeg})`}>
                  <polygon
                    points="0,-6 4,4 0,2 -4,4"
                    fill="#FFFFFF"
                  />
                </g>

                {/* Monospace Plate Label Pill */}
                <g transform={`translate(${cx}, ${cy - (isSelected ? 22 : 18)})`}>
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="18"
                    rx="4"
                    fill={isLight ? '#FFFFFF' : '#0F172A'}
                    stroke={isSelected ? '#D97706' : isMoving ? '#2563EB' : '#94A3B8'}
                    strokeWidth="1.5"
                    className="filter drop-shadow"
                  />
                  <text
                    x="0"
                    y="2"
                    fill={isSelected ? '#D97706' : isLight ? '#0F172A' : '#E2E8F0'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {trip.vehiclePlate}
                  </text>
                </g>

                {/* Speed indicator if moving */}
                {isMoving && (
                  <text
                    x={cx}
                    y={cy + (isSelected ? 24 : 20)}
                    fill={isLight ? '#0284C7' : '#38BDF8'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {trip.speedKmh} km/h
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Trip Details Drawer at bottom of map */}
      {selectedTrip && (
        <div className={`p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs z-10 transition-colors ${
          isLight
            ? 'bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-800'
            : 'bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 text-sm">{selectedTrip.vehiclePlate}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                  {selectedTrip.status}
                </span>
                <span className="text-slate-500">Driver: <strong className="text-slate-800">{selectedTrip.driverName}</strong></span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Cargo: <span className="text-slate-800 font-semibold">{selectedTrip.cargoDescription}</span> ({selectedTrip.cargoWeightTon} Ton)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Route ETA</div>
              <div className="font-mono font-bold text-emerald-600 text-sm">{selectedTrip.etaMinutes} mins ({selectedTrip.distanceRemainingKm} km)</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Speed / Battery</div>
              <div className="font-mono font-bold text-blue-600 text-sm">{selectedTrip.speedKmh} km/h • {selectedTrip.batteryPct}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
