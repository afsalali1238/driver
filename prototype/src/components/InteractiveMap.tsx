'use client';

import React, { useState } from 'react';
import { TripData } from '../data/dummyData';
import { Navigation, MapPin, Truck, AlertCircle, Layers, CheckCircle2 } from './Icons';

interface InteractiveMapProps {
  trips: TripData[];
  selectedTripId?: string;
  onSelectTrip?: (trip: TripData) => void;
  className?: string;
  theme?: 'light' | 'dark';
  categoryFilter?: 'ALL' | 'EQUIPMENT' | 'FREIGHT';
  onCategoryChange?: (category: 'ALL' | 'EQUIPMENT' | 'FREIGHT') => void;
}

// UAE geographic bounding box for SVG projection
// Lat: 23.5 to 26.2 (North)
// Lng: 52.0 to 56.6 (East)
function projectCoords(
  lat: number, 
  lng: number, 
  width: number, 
  height: number,
  zoom: number,
  panX: number,
  panY: number
): [number, number] {
  const minLat = 23.5;
  const maxLat = 26.2;
  const minLng = 52.0;
  const maxLng = 56.6;

  // Base normalized coordinates
  const normX = (lng - minLng) / (maxLng - minLng);
  const normY = 1 - (lat - minLat) / (maxLat - minLat); // Invert for SVG

  // Apply zoom and pan offset around center (0.5, 0.5)
  const centerX = width / 2;
  const centerY = height / 2;

  const rawX = normX * width;
  const rawY = normY * height;

  const x = centerX + (rawX - centerX) * zoom + panX;
  const y = centerY + (rawY - centerY) * zoom + panY;

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
  const [mapStyle, setMapStyle] = useState<'STREET' | 'SATELLITE' | 'RADAR'>('STREET');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const selectedTrip = trips.find(t => t.id === selectedTripId) || displayedTrips[0];

  // SVG Map Canvas Base Dimensions
  const mapWidth = 960;
  const mapHeight = 540;

  // Key UAE Landmarks & Industrial Ports
  const landmarks = [
    { name: 'Abu Dhabi (Capital)', coords: [24.4539, 54.3773], type: 'CITY' },
    { name: 'Dubai', coords: [25.2048, 55.2708], type: 'CITY' },
    { name: 'Sharjah', coords: [25.3463, 55.4209], type: 'CITY' },
    { name: 'Jebel Ali Port (DPW)', coords: [25.0050, 55.0600], type: 'PORT' },
    { name: 'Khalifa Port & KIZAD', coords: [24.8100, 54.6700], type: 'PORT' },
    { name: 'Ruwais Refinery (ADNOC)', coords: [24.1102, 52.7305], type: 'INDUSTRIAL' },
    { name: 'Dubai South (DWC Logistics)', coords: [24.8934, 55.1582], type: 'INDUSTRIAL' },
    { name: 'Hamriyah Free Zone', coords: [25.4651, 55.4981], type: 'PORT' },
    { name: 'Mussafah Industrial City', coords: [24.3412, 54.5123], type: 'INDUSTRIAL' },
    { name: 'Al Ain', coords: [24.2075, 55.7447], type: 'CITY' },
    { name: 'Ras Al Khaimah', coords: [25.7890, 55.9432], type: 'CITY' },
  ];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.5, +(prev + 0.3).toFixed(1)));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.8, +(prev - 0.3).toFixed(1)));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-md flex flex-col select-none transition-colors ${
      isLight 
        ? 'bg-slate-100 border-slate-200' 
        : 'bg-[#0B0F19] border-slate-800 shadow-2xl'
    } ${className}`}>
      
      {/* ======================================================== */}
      {/* TOP FLOATING INTERACTIVE CONTROLS BAR */}
      {/* ======================================================== */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
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

        {/* Right: Map Style Engine Switcher & Zoom Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Style Pills */}
          <div className={`flex items-center p-1 rounded-xl border backdrop-blur-md shadow-lg text-xs font-semibold ${
            isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
          }`}>
            <button
              onClick={() => setMapStyle('STREET')}
              className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                mapStyle === 'STREET'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🗺️ Street Map
            </button>

            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                mapStyle === 'SATELLITE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🛰️ Satellite
            </button>

            <button
              onClick={() => setMapStyle('RADAR')}
              className={`px-2.5 py-1 rounded-lg transition-all font-mono text-[11px] ${
                mapStyle === 'RADAR'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🧭 Radar
            </button>
          </div>

          {/* Zoom In / Out / Reset Controls */}
          <div className={`flex items-center p-0.5 rounded-xl border backdrop-blur-md shadow-lg text-xs font-mono font-bold ${
            isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
          }`}>
            <button
              onClick={handleZoomIn}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-black"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-black"
              title="Zoom Out"
            >
              −
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={handleResetZoom}
                className="px-2 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px]"
                title="Reset Zoom"
              >
                Reset ({zoomLevel}x)
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* REALISTIC HIGH-PRECISION UAE GEOGRAPHIC MAP CANVAS */}
      {/* ======================================================== */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="uaeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke={mapStyle === 'SATELLITE' ? "rgba(255,255,255,0.06)" : isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"} 
                strokeWidth="1" 
              />
            </pattern>

            {/* Ocean Water Shading Gradient */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              {mapStyle === 'SATELLITE' ? (
                <>
                  <stop offset="0%" stopColor="#0B192C" />
                  <stop offset="100%" stopColor="#030C19" />
                </>
              ) : isLight ? (
                <>
                  <stop offset="0%" stopColor="#BAE6FD" />
                  <stop offset="100%" stopColor="#7DD3FC" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#020617" />
                </>
              )}
            </linearGradient>

            {/* Landmass Ground Gradient */}
            <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              {mapStyle === 'SATELLITE' ? (
                <>
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="50%" stopColor="#1E212B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </>
              ) : isLight ? (
                <>
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="50%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0B0F19" />
                </>
              )}
            </linearGradient>

            {/* Vehicle Glow Filter */}
            <filter id="markerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Arabian Gulf Ocean Background */}
          <rect width={mapWidth} height={mapHeight} fill="url(#oceanGrad)" />

          {/* 2. Realistic UAE Landmass Shape (Ruwais to RAK and Western Region) */}
          {/* Geographic Path covering UAE territory */}
          <path
            d="
              M 0 540 
              L 0 420 
              Q 80 430 160 410 
              Q 260 380 340 330 
              T 480 270 
              T 580 220 
              T 680 160 
              T 750 110 
              T 820 60 
              L 880 40 
              L 960 40 
              L 960 540 
              Z
            "
            fill="url(#landGrad)"
            stroke={mapStyle === 'SATELLITE' ? "#334155" : isLight ? "#CBD5E1" : "#334155"}
            strokeWidth="2"
          />

          {/* Desert Sand Dunes / Terrain Texture Lines */}
          <path
            d="M 120 480 Q 300 450 480 490 T 800 470"
            fill="none"
            stroke={mapStyle === 'SATELLITE' ? "rgba(255,255,255,0.05)" : isLight ? "rgba(203, 213, 225, 0.6)" : "rgba(255,255,255,0.03)"}
            strokeWidth="1.5"
            strokeDasharray="4,6"
          />

          {/* Arabian Gulf Text Watermark */}
          <text 
            x="320" 
            y="140" 
            fill={mapStyle === 'SATELLITE' ? "rgba(56, 189, 248, 0.2)" : isLight ? "rgba(2, 132, 199, 0.45)" : "rgba(56, 189, 248, 0.25)"} 
            fontSize="15" 
            fontWeight="800" 
            letterSpacing="5"
          >
            ARABIAN GULF (COASTAL FREIGHT MARITIME ZONE)
          </text>

          {/* Optional Background Grid */}
          <rect width={mapWidth} height={mapHeight} fill="url(#uaeGrid)" opacity="0.6" />

          {/* 3. Major UAE Highway Network Arteries */}
          {/* E11 Highway (Sheikh Zayed Road Corridor: Ruwais -> Abu Dhabi -> Jebel Ali -> Dubai -> Sharjah -> RAK) */}
          <path
            d="
              M 110 435 
              Q 250 400 370 340 
              T 520 280 
              T 640 200 
              T 740 140 
              T 810 80
            "
            fill="none"
            stroke={isLight && mapStyle !== 'SATELLITE' ? "#64748B" : "#94A3B8"}
            strokeWidth="5"
            opacity={mapStyle === 'SATELLITE' ? "0.6" : "0.85"}
          />
          {/* E11 Centerline */}
          <path
            d="
              M 110 435 
              Q 250 400 370 340 
              T 520 280 
              T 640 200 
              T 740 140 
              T 810 80
            "
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="8,6"
            opacity="0.9"
          />
          <text 
            x="525" 
            y="265" 
            fill={isLight && mapStyle !== 'SATELLITE' ? "#334155" : "#E2E8F0"} 
            fontSize="10" 
            fontWeight="800"
            fontFamily="monospace"
            transform="rotate(-28 525 265)"
          >
            E11 SHEIKH ZAYED CORRIDOR
          </text>

          {/* E311 Sheikh Mohammed Bin Zayed Road (Inland Freight Bypass) */}
          <path
            d="M 420 370 Q 560 300 680 180 T 780 100"
            fill="none"
            stroke={isLight && mapStyle !== 'SATELLITE' ? "#94A3B8" : "#64748B"}
            strokeWidth="3.5"
            opacity="0.75"
          />
          <text 
            x="600" 
            y="270" 
            fill={isLight && mapStyle !== 'SATELLITE' ? "#475569" : "#94A3B8"} 
            fontSize="9" 
            fontWeight="700"
            fontFamily="monospace"
            transform="rotate(-30 600 270)"
          >
            E311 TRUCK BYPASS
          </text>

          {/* E611 Emirates Road (Heavy Haulage Route) */}
          <path
            d="M 460 410 Q 610 330 730 200 T 820 120"
            fill="none"
            stroke={isLight && mapStyle !== 'SATELLITE' ? "#CBD5E1" : "#475569"}
            strokeWidth="3"
            strokeDasharray="5,4"
            opacity="0.7"
          />

          {/* E66 Dubai - Al Ain Highway */}
          <path
            d="M 640 200 L 780 390"
            fill="none"
            stroke={isLight && mapStyle !== 'SATELLITE' ? "#94A3B8" : "#64748B"}
            strokeWidth="2.5"
            opacity="0.6"
          />

          {/* E22 Abu Dhabi - Al Ain Highway */}
          <path
            d="M 370 340 L 780 390"
            fill="none"
            stroke={isLight && mapStyle !== 'SATELLITE' ? "#94A3B8" : "#64748B"}
            strokeWidth="2.5"
            opacity="0.6"
          />

          {/* 4. Major UAE Landmarks, Cities & Ports */}
          {landmarks.map(lm => {
            const [lx, ly] = projectCoords(lm.coords[0], lm.coords[1], mapWidth, mapHeight, zoomLevel, pan.x, pan.y);
            const isPort = lm.type === 'PORT';
            const isIndustrial = lm.type === 'INDUSTRIAL';

            return (
              <g key={lm.name} transform={`translate(${lx}, ${ly})`}>
                <circle 
                  r={isPort || isIndustrial ? "5" : "4"} 
                  fill={isPort ? "#0284C7" : isIndustrial ? "#D97706" : "#64748B"} 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5" 
                />
                <text 
                  x="8" 
                  y="4" 
                  fill={mapStyle === 'SATELLITE' ? "#F8FAFC" : isLight ? "#1E293B" : "#F1F5F9"} 
                  fontSize="10" 
                  fontWeight={isPort || isIndustrial ? "800" : "600"} 
                  fontFamily="system-ui, sans-serif"
                >
                  {isPort ? '⚓ ' : isIndustrial ? '🏭 ' : ''}{lm.name}
                </text>
              </g>
            );
          })}

          {/* 5. Active Vehicle Route Breadcrumbs */}
          {displayedTrips.map(trip => {
            if (trip.routeTrail.length < 2) return null;
            const isSelected = trip.id === selectedTrip?.id;
            const isEquipment = trip.category === 'EQUIPMENT';
            const strokeColor = isEquipment ? '#D97706' : '#0284C7';

            const points = trip.routeTrail.map(coords => {
              const [px, py] = projectCoords(coords[0], coords[1], mapWidth, mapHeight, zoomLevel, pan.x, pan.y);
              return `${px},${py}`;
            }).join(' ');

            return (
              <polyline
                key={`route-${trip.id}`}
                points={points}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isSelected ? "4.5" : "2.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isSelected ? "0.9" : "0.5"}
              />
            );
          })}

          {/* 6. Active Vehicles Telematics Markers (Equipment vs Freight) */}
          {displayedTrips.map(trip => {
            const [vx, vy] = projectCoords(trip.currentCoords[0], trip.currentCoords[1], mapWidth, mapHeight, zoomLevel, pan.x, pan.y);
            const isSelected = trip.id === selectedTrip?.id;
            const isEquipment = trip.category === 'EQUIPMENT';
            const isMoving = trip.status === 'IN_TRANSIT';

            const primaryColor = isEquipment ? '#D97706' : '#0284C7';
            const badgeBg = isEquipment ? '#FEF3C7' : '#E0F2FE';
            const badgeText = isEquipment ? '#92400E' : '#0369A1';
            const iconEmoji = isEquipment ? '🚜' : '📦';

            return (
              <g 
                key={trip.id} 
                transform={`translate(${vx}, ${vy})`}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectTrip && onSelectTrip(trip)}
              >
                {/* Active Movement Pulsing Ring */}
                {isMoving && (
                  <circle 
                    r={isSelected ? "24" : "18"} 
                    fill="none" 
                    stroke={primaryColor} 
                    strokeWidth="2" 
                    opacity="0.4"
                    className="animate-ping" 
                  />
                )}

                {/* Base Outer Circle */}
                <circle 
                  r={isSelected ? "17" : "13"} 
                  fill={isSelected ? '#0F172A' : '#FFFFFF'} 
                  stroke={primaryColor} 
                  strokeWidth={isSelected ? "3.5" : "2.5"} 
                  filter="url(#markerGlow)"
                />

                {/* Category Icon Emoji inside pin */}
                <text 
                  x="0" 
                  y={isSelected ? "5" : "4"} 
                  textAnchor="middle" 
                  fontSize={isSelected ? "14" : "11"}
                >
                  {iconEmoji}
                </text>

                {/* Directional Heading Arrow */}
                {isMoving && (
                  <g transform={`rotate(${trip.headingDeg})`}>
                    <polygon 
                      points="0,-22 -4,-15 4,-15" 
                      fill={primaryColor} 
                    />
                  </g>
                )}

                {/* High-Visibility Callout Tag */}
                <g transform="translate(18, -12)">
                  <rect 
                    x="0" 
                    y="0" 
                    width={isSelected ? "135" : "115"} 
                    height="24" 
                    rx="6" 
                    fill={isSelected ? primaryColor : badgeBg} 
                    stroke={primaryColor} 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x="6" 
                    y="16" 
                    fill={isSelected ? '#FFFFFF' : badgeText} 
                    fontSize="10" 
                    fontWeight="800" 
                    fontFamily="ui-monospace, monospace"
                  >
                    {trip.vehiclePlate} {isMoving ? `• ${trip.speedKmh}k` : ''}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM FLOATING SUMMARY & ACTIVE CALLOUT CARD */}
      {/* ======================================================== */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Legend Indicator */}
        <div className={`pointer-events-auto flex items-center gap-3 px-3.5 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-mono font-bold shadow-md ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-slate-900/90 border-slate-700 text-slate-300'
        }`}>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            🚜 Heavy Equipment ({trips.filter(t => t.category === 'EQUIPMENT').length})
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            📦 Commercial Freight ({trips.filter(t => t.category === 'FREIGHT').length})
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-bold">🟢 Live Telemetry Active</span>
        </div>

        {/* Right: Quick Zoom Notice */}
        <div className={`pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-mono ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-600' : 'bg-slate-900/90 border-slate-700 text-slate-300'
        }`}>
          <span>Click vehicle pin to inspect • Use + / - to zoom corridors</span>
        </div>

      </div>

    </div>
  );
}
