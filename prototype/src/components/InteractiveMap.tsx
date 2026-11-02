'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TripData } from '../data/dummyData';
import { Navigation, MapPin, Truck, AlertCircle, Layers } from './Icons';

// Dynamically import Leaflet map with SSR disabled
const LeafletFleetMap = dynamic(
  () => import('./LeafletFleetMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono text-xs gap-2">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Real Geographic UAE Map...</span>
      </div>
    )
  }
);

interface InteractiveMapProps {
  trips: TripData[];
  selectedTripId?: string;
  onSelectTrip?: (trip: TripData) => void;
  className?: string;
  theme?: 'light' | 'dark';
  categoryFilter?: 'ALL' | 'EQUIPMENT' | 'FREIGHT';
  onCategoryChange?: (category: 'ALL' | 'EQUIPMENT' | 'FREIGHT') => void;
}

// UAE geographic bounding box for SVG projection (for Radar mode)
function projectCoords(lat: number, lng: number, width: number, height: number): [number, number] {
  const minLat = 23.8;
  const maxLat = 26.0;
  const minLng = 52.5;
  const maxLng = 56.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

export default function InteractiveMap({ 
  trips, 
  selectedTripId, 
  onSelectTrip, 
  className = '',
  theme = 'light',
  categoryFilter = 'ALL',
  onCategoryChange
}: InteractiveMapProps) {
  const isLight = theme === 'light';
  const [internalCategory, setInternalCategory] = useState<'ALL' | 'EQUIPMENT' | 'FREIGHT'>('ALL');
  const [mapMode, setMapMode] = useState<'REAL' | 'SATELLITE' | 'RADAR'>('REAL');

  const activeCategory = onCategoryChange ? categoryFilter : internalCategory;
  const handleCategorySelect = (cat: 'ALL' | 'EQUIPMENT' | 'FREIGHT') => {
    if (onCategoryChange) onCategoryChange(cat);
    else setInternalCategory(cat);
  };

  // Filter trips based on active category
  const displayedTrips = trips.filter(t => {
    if (activeCategory === 'EQUIPMENT') return t.category === 'EQUIPMENT';
    if (activeCategory === 'FREIGHT') return t.category === 'FREIGHT';
    return true;
  });

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  // SVG Radar Constants
  const mapWidth = 900;
  const mapHeight = 520;

  const landmarks = [
    { name: 'Abu Dhabi', coords: [24.4539, 54.3773] as [number, number] },
    { name: 'Dubai', coords: [25.2048, 55.2708] as [number, number] },
    { name: 'Sharjah', coords: [25.3463, 55.4209] as [number, number] },
    { name: 'Jebel Ali Port', coords: [25.0050, 55.0600] as [number, number] },
    { name: 'Al Ain', coords: [24.2075, 55.7447] as [number, number] },
    { name: 'Ruwais', coords: [24.1102, 52.7305] as [number, number] },
  ];

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-md flex flex-col transition-colors ${
      isLight 
        ? 'bg-slate-50 border-slate-200' 
        : 'bg-[#0B0F19] border-slate-800 shadow-2xl'
    } ${className}`}>
      
      {/* ======================================================== */}
      {/* TOP FLOATING INTERACTIVE CONTROLS BAR */}
      {/* ======================================================== */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Category Selector (All / Equipment / Freight) */}
        <div className={`pointer-events-auto flex items-center p-1 rounded-xl border backdrop-blur-md shadow-lg text-xs font-semibold ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
        }`}>
          <button
            onClick={() => handleCategorySelect('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Cargo</span>
            <span className="font-mono text-[10px] opacity-75">({trips.length})</span>
          </button>

          <button
            onClick={() => handleCategorySelect('EQUIPMENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'EQUIPMENT'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            <span>🚜 Heavy Equipment</span>
            <span className="font-mono text-[10px] opacity-75">({trips.filter(t => t.category === 'EQUIPMENT').length})</span>
          </button>

          <button
            onClick={() => handleCategorySelect('FREIGHT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'FREIGHT'
                ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            <span>📦 Commercial Freight</span>
            <span className="font-mono text-[10px] opacity-75">({trips.filter(t => t.category === 'FREIGHT').length})</span>
          </button>
        </div>

        {/* Right: Map Engine Switcher & Status */}
        <div className={`pointer-events-auto flex items-center p-1 rounded-xl border backdrop-blur-md shadow-lg text-xs font-semibold ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
        }`}>
          <button
            onClick={() => setMapMode('REAL')}
            className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
              mapMode === 'REAL'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Real interactive OpenStreetMap tiles"
          >
            🗺️ Street Map
          </button>

          <button
            onClick={() => setMapMode('SATELLITE')}
            className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
              mapMode === 'SATELLITE'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="High-definition satellite aerial imagery"
          >
            🛰️ Satellite
          </button>

          <button
            onClick={() => setMapMode('RADAR')}
            className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
              mapMode === 'RADAR'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Corridor telemetry schematic"
          >
            🧭 Radar
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MAP VIEW CANVAS (LEAFLET REAL MAP vs SVG RADAR) */}
      {/* ======================================================== */}
      {mapMode !== 'RADAR' ? (
        <div className="relative w-full h-full min-h-[380px]">
          <LeafletFleetMap
            trips={displayedTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={onSelectTrip}
            theme={theme}
            mapType={mapMode === 'SATELLITE' ? 'SATELLITE' : 'STREET'}
          />
        </div>
      ) : (
        /* Fallback / Alternative SVG Radar Canvas */
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <svg 
            viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
            className="w-full h-full object-contain select-none"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path 
                  d="M 40 0 L 0 0 0 40" 
                  fill="none" 
                  stroke={isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.04)"} 
                  strokeWidth="1" 
                />
              </pattern>
            </defs>

            <rect width={mapWidth} height={mapHeight} fill={isLight ? "#F8FAFC" : "#0B0F19"} />
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

            {/* Coastline */}
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

            {/* E11 Highway */}
            <path
              d="M 60 410 Q 250 380 430 330 T 630 180 T 710 130"
              fill="none"
              stroke={isLight ? "rgba(100, 116, 139, 0.35)" : "rgba(148, 163, 184, 0.2)"}
              strokeWidth="4"
            />

            {/* Landmarks */}
            {landmarks.map(lm => {
              const [px, py] = projectCoords(lm.coords[0], lm.coords[1], mapWidth, mapHeight);
              return (
                <g key={lm.name} transform={`translate(${px}, ${py})`}>
                  <circle r="4" fill={isLight ? "#64748B" : "#94A3B8"} opacity="0.6" />
                  <text 
                    x="8" 
                    y="4" 
                    fill={isLight ? "#475569" : "#94A3B8"} 
                    fontSize="11" 
                    fontWeight="600" 
                    fontFamily="monospace"
                  >
                    {lm.name}
                  </text>
                </g>
              );
            })}

            {/* Vehicle Markers in Radar Mode */}
            {displayedTrips.map(trip => {
              const [cx, cy] = projectCoords(trip.currentCoords[0], trip.currentCoords[1], mapWidth, mapHeight);
              const isSelected = trip.id === selectedTripId;
              const isEquipment = trip.category === 'EQUIPMENT';
              const markerColor = isEquipment ? '#F59E0B' : '#0284C7';

              return (
                <g 
                  key={trip.id} 
                  transform={`translate(${cx}, ${cy})`}
                  className="cursor-pointer"
                  onClick={() => onSelectTrip && onSelectTrip(trip)}
                >
                  <circle r={isSelected ? "14" : "10"} fill={markerColor} opacity={isSelected ? "0.9" : "0.75"} />
                  <circle r={isSelected ? "22" : "16"} fill="none" stroke={markerColor} strokeWidth="1.5" opacity="0.4" />
                  <text 
                    x="18" 
                    y="-4" 
                    fill={isLight ? "#0F172A" : "#FFFFFF"} 
                    fontSize="11" 
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {isEquipment ? '🚜 ' : '📦 '}{trip.vehiclePlate} ({trip.speedKmh} km/h)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Bottom Floating Legend Bar */}
      <div className={`absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-mono font-bold shadow-md ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-slate-900/90 border-slate-700 text-slate-300'
      }`}>
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          🚜 Heavy Equipment
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5 text-blue-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          📦 Commercial Freight
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-emerald-700">🟢 Live Ingestion (5s)</span>
      </div>

    </div>
  );
}
