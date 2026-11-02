'use client';

import React, { useState } from 'react';
import { TripData, FLEET_METRICS } from '../data/dummyData';
import InteractiveMap from './InteractiveMap';
import { 
  Truck, ShieldCheck, MapPin, Gauge, Radio, Play, Pause, 
  RotateCcw, CheckCircle2, AlertTriangle, FileText, Plus,
  Search, ExternalLink, BatteryCharging, UserCheck, Eye, Layers
} from './Icons';

interface OpsAdminViewProps {
  trips: TripData[];
  onSelectTripForCustomerView?: (token: string) => void;
  onSelectTripForDriverView?: (tripId: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  theme?: 'light' | 'dark';
}

export default function OpsAdminView({
  trips,
  onSelectTripForCustomerView,
  onSelectTripForDriverView,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  theme = 'light'
}: OpsAdminViewProps) {
  const isLight = theme === 'light';
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || 'KSP-EQ-101');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'EQUIPMENT' | 'FREIGHT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TRANSIT' | 'ASSIGNED' | 'DELIVERED'>('ALL');
  const [search, setSearch] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [inspectEpodTrip, setInspectEpodTrip] = useState<TripData | null>(null);

  const filteredTrips = trips.filter(trip => {
    if (categoryFilter !== 'ALL' && trip.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && trip.status !== statusFilter) return false;
    if (search && !trip.vehiclePlate.toLowerCase().includes(search.toLowerCase()) &&
        !trip.driverName.toLowerCase().includes(search.toLowerCase()) &&
        !trip.cargoDescription.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedTrip = trips.find(t => t.id === selectedTripId) || filteredTrips[0] || trips[0];

  // Dynamic calculations based on category
  const activeCategoryTrips = categoryFilter === 'ALL' ? trips : trips.filter(t => t.category === categoryFilter);
  const totalTons = activeCategoryTrips.reduce((acc, t) => acc + t.cargoWeightTon, 0).toFixed(1);
  const movingCount = activeCategoryTrips.filter(t => t.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Telematics Simulation Control Bar */}
      <div className={`rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isLight
          ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
          : 'bg-slate-900 border border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base tracking-wide">KASPER OPS TELEMATICS DISPATCH</h2>
              <span className="bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                STANDALONE NODE & POSTGRES
              </span>
            </div>
            <p className="text-slate-500 text-xs">Trip-Gated Privacy Architecture • Dual-Process SQLite Buffer • Zero Teltonika Hardware</p>
          </div>
        </div>

        {/* Live Simulation Control Panel for Founder Demo */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <span className="text-slate-500 px-2 font-mono font-bold">SIMULATION:</span>
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Pause Stream' : 'Start Live Telemetry'}
          </button>
          <button
            onClick={onResetSimulation}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              isLight ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Reset telemetry positions to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ASSET CATEGORY SWITCHER (EQUIPMENT vs FREIGHT TOGGLE) */}
      {/* ======================================================== */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-wider pl-1">
            FLEET ASSET CATEGORY:
          </span>

          <div className={`flex p-1 rounded-xl border text-xs font-bold ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSelectedTripId(trips[0].id);
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>🌟 All Assets</span>
              <span className="font-mono text-[10px] opacity-75">({trips.length})</span>
            </button>

            <button
              onClick={() => {
                setCategoryFilter('EQUIPMENT');
                const firstEq = trips.find(t => t.category === 'EQUIPMENT');
                if (firstEq) setSelectedTripId(firstEq.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                categoryFilter === 'EQUIPMENT'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <span>🚜 Heavy Equipment</span>
              <span className="font-mono text-[10px] opacity-75">
                ({trips.filter(t => t.category === 'EQUIPMENT').length})
              </span>
            </button>

            <button
              onClick={() => {
                setCategoryFilter('FREIGHT');
                const firstFr = trips.find(t => t.category === 'FREIGHT');
                if (firstFr) setSelectedTripId(firstFr.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                categoryFilter === 'FREIGHT'
                  ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              <span>📦 Commercial Freight</span>
              <span className="font-mono text-[10px] opacity-75">
                ({trips.filter(t => t.category === 'FREIGHT').length})
              </span>
            </button>
          </div>
        </div>

        {/* Live Filter Indicator Description */}
        <div className="text-xs font-mono flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Showing:</span>
          <span className={`px-2 py-0.5 rounded font-bold text-xs ${
            categoryFilter === 'EQUIPMENT' 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : categoryFilter === 'FREIGHT' 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {categoryFilter === 'EQUIPMENT' && '🚜 Heavy Machinery (CAT Excavators, Cranes, Boom Lifts, Generators)'}
            {categoryFilter === 'FREIGHT' && '📦 Commercial Freight (Precast Beams, Shipping Containers, Pipe Spools, Steel)'}
            {categoryFilter === 'ALL' && '🌐 Combined Fleet: 4 Equipment + 4 Freight Loads'}
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {categoryFilter === 'EQUIPMENT' ? 'Equipment Assets' : categoryFilter === 'FREIGHT' ? 'Freight Loads' : 'Total Fleet'}
          </div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {activeCategoryTrips.length}
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {categoryFilter === 'EQUIPMENT' ? 'Excavators, Cranes, Lifts' : categoryFilter === 'FREIGHT' ? 'Beams, Containers, Steel' : 'Combined assets'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border border-l-4 border-l-blue-500 transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-blue-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            En Route
          </div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {movingCount}
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">Streaming 5s GPS batches</div>
        </div>

        <div className={`p-4 rounded-2xl border border-l-4 border-l-amber-500 transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-amber-600 text-[11px] font-bold uppercase tracking-wider">Gross Weight</div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {totalTons} <span className="text-sm font-normal text-slate-500">Tons</span>
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">Total cargo tonnage en route</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">GPS Precision</div>
          <div className="text-emerald-600 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.gpsUptime}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Highways & Western desert</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">On-Time Rate</div>
          <div className="text-emerald-600 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.onTimeRate}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">SLA delivery benchmark</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">SQLite Buffer</div>
          <div className="text-amber-600 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.offlineBufferedSyncs}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Recovered from dead zones</div>
        </div>
      </div>

      {/* Main Operations Split View: Map + Vehicle Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left 8 Cols: Interactive UAE Telemetry Map (Leaflet Street / Satellite / Radar) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[520px] rounded-2xl overflow-hidden shadow-sm">
            <InteractiveMap
              trips={trips}
              selectedTripId={selectedTrip?.id}
              onSelectTrip={(trip) => setSelectedTripId(trip.id)}
              theme={theme}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>

          {/* Active Selected Vehicle Detail Card */}
          {selectedTrip && (
            <div className={`rounded-2xl p-4 transition-colors ${
              isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-900 border border-slate-800 shadow-lg'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-black text-lg px-2.5 py-1 rounded border ${
                    selectedTrip.category === 'EQUIPMENT' 
                      ? 'bg-amber-50 text-amber-700 border-amber-300' 
                      : 'bg-blue-50 text-blue-700 border-blue-300'
                  }`}>
                    {selectedTrip.category === 'EQUIPMENT' ? '🚜 ' : '📦 '}{selectedTrip.vehiclePlate}
                  </span>
                  <div>
                    <h3 className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedTrip.cargoDescription}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Permit: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{selectedTrip.transportPermit}</span> • Gross: <strong className="text-slate-800 dark:text-slate-200">{selectedTrip.cargoWeightTon} Tons</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectTripForDriverView && (
                    <button
                      onClick={() => onSelectTripForDriverView(selectedTrip.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      View in Driver App
                    </button>
                  )}
                  {onSelectTripForCustomerView && (
                    <button
                      onClick={() => onSelectTripForCustomerView(selectedTrip.trackingToken)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-700 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Customer Live Link
                    </button>
                  )}
                </div>
              </div>

              {/* Waypoint Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'}`}>
                  <div className="text-emerald-600 font-bold flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    ORIGIN YARD / PICKUP
                  </div>
                  <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedTrip.originName}</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-1">
                    COORDS: {selectedTrip.originCoords[0].toFixed(4)}, {selectedTrip.originCoords[1].toFixed(4)}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'}`}>
                  <div className="text-rose-600 font-bold flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    DESTINATION SITE
                  </div>
                  <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedTrip.destinationName}</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-1">
                    COORDS: {selectedTrip.destinationCoords[0].toFixed(4)}, {selectedTrip.destinationCoords[1].toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Fleet Vehicle Roster */}
        <div className="lg:col-span-4 space-y-3">
          <div className={`rounded-2xl p-4 shadow-sm transition-colors ${
            isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800 shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  FLEET ROSTER ({filteredTrips.length})
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {categoryFilter === 'ALL' ? 'Equipment + Freight' : categoryFilter === 'EQUIPMENT' ? 'Equipment Only' : 'Freight Only'}
                </span>
              </div>
              <button 
                onClick={() => setShowDispatchModal(true)}
                className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Dispatch Trip
              </button>
            </div>

            {/* Status Filter pills */}
            <div className={`flex gap-1 mb-3 p-1 rounded-xl text-[11px] font-bold ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
              {(['ALL', 'IN_TRANSIT', 'ASSIGNED', 'DELIVERED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    statusFilter === tab 
                      ? 'bg-white text-slate-950 shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'IN_TRANSIT' ? 'Transit' : tab === 'ASSIGNED' ? 'Assigned' : 'Done'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search plate, driver, cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs transition-colors focus:outline-none ${
                  isLight 
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500' 
                    : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-amber-500/50'
                }`}
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => {
                const isSelected = trip.id === selectedTrip?.id;
                const isEquipment = trip.category === 'EQUIPMENT';

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? isLight
                          ? isEquipment 
                            ? 'bg-amber-50/70 border-amber-500/80 shadow-md ring-1 ring-amber-500/30' 
                            : 'bg-blue-50/70 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                          : 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                        : isLight
                          ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-950/60 border-slate-800/70 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isEquipment 
                            ? 'bg-amber-100 text-amber-800 border-amber-300' 
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {isEquipment ? '🚜 EQUIP' : '📦 FREIGHT'}
                        </span>
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                          isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-900 text-white border-slate-700'
                        }`}>
                          {trip.vehiclePlate}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        trip.status === 'IN_TRANSIT' ? 'bg-blue-500/15 text-blue-700 border border-blue-500/30' :
                        trip.status === 'ASSIGNED' ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30' :
                        trip.status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className={`font-bold text-xs truncate ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      {trip.cargoDescription}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>👤 {trip.driverName}</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        {trip.status === 'IN_TRANSIT' ? `${trip.speedKmh} km/h • ${trip.etaMinutes}m ETA` : `${trip.cargoWeightTon} Ton`}
                      </span>
                    </div>

                    {trip.epod?.signedAt && trip.status === 'DELIVERED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEpodTrip(trip);
                        }}
                        className="mt-2 w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Signed Consignment (ePOD)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ePOD Inspector Modal */}
      {inspectEpodTrip && inspectEpodTrip.epod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-base">Verified Delivery Proof</h3>
                <span className="text-xs font-mono text-slate-500">REF: {inspectEpodTrip.epod.consignmentNumber}</span>
              </div>
              <button
                onClick={() => setInspectEpodTrip(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-mono text-[10px]">CONSIGNEE RECEIVER</div>
                <div className="font-bold text-sm text-slate-900">{inspectEpodTrip.epod.receiverName}</div>
                <div className="text-slate-600 text-xs">{inspectEpodTrip.epod.receiverRole}</div>
                <div className="text-slate-500 font-mono text-[11px]">{inspectEpodTrip.epod.receiverPhone}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-mono text-[10px] mb-1">SIGNATURE AUDIT TRAIL</div>
                <div className="bg-white p-2 rounded-lg border border-slate-300 flex items-center justify-center h-20">
                  <div className="text-emerald-600 font-mono text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Cryptographically Signed & Timestamped</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  Signed At: {inspectEpodTrip.epod.signedAt}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800">
                <strong>Notes:</strong> {inspectEpodTrip.epod.deliveryNotes}
              </div>
            </div>

            <button
              onClick={() => setInspectEpodTrip(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Dispatch Modal Simulator */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-base">Dispatch New Heavy Haulage Trip</h3>
                <span className="text-xs font-mono text-slate-500">Trip-Gated Privacy Architecture</span>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-[10px] text-slate-500 font-bold block mb-1">ASSET CLASSIFICATION</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl bg-amber-500 text-slate-950 font-bold border border-amber-500 text-xs flex items-center justify-center gap-1.5">
                    <span>🚜 Heavy Equipment</span>
                  </button>
                  <button className="py-2 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200 text-xs flex items-center justify-center gap-1.5">
                    <span>📦 Commercial Freight</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-slate-500 font-bold block mb-1">CARGO MANIFEST SPECIFICATION</label>
                <input 
                  type="text" 
                  defaultValue="Komatsu PC200-8M0 Hydraulic Excavator (21 Ton)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] text-slate-500 font-bold block mb-1">ORIGIN YARD</label>
                  <input 
                    type="text" 
                    defaultValue="JAFZA Gate 4 Yard, Dubai"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-slate-500 font-bold block mb-1">DESTINATION SITE</label>
                  <input 
                    type="text" 
                    defaultValue="Al Dhafra Solar PV2, Abu Dhabi"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                <strong>Driver Privacy Enforcement:</strong> Tracking credentials will activate only upon driver clicking <em>"START TRIP"</em> on their mobile app.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Trip Dispatched! Push notification delivered to driver smartphone.');
                  setShowDispatchModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
              >
                Confirm Dispatch ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
