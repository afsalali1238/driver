'use client';

import React, { useState } from 'react';
import { TripData, FLEET_METRICS } from '../../data/dummyData';
import InteractiveMap from './InteractiveMap';
import { 
  Truck, ShieldCheck, MapPin, Gauge, Radio, Play, Pause, 
  RotateCcw, CheckCircle2, AlertTriangle, FileText, Plus,
  Search, ExternalLink, BatteryCharging, UserCheck, Eye
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
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || 'KSP-TR-2041');
  const [filter, setFilter] = useState<'ALL' | 'IN_TRANSIT' | 'ASSIGNED' | 'AVAILABLE'>('ALL');
  const [search, setSearch] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [inspectEpodTrip, setInspectEpodTrip] = useState<TripData | null>(null);

  const filteredTrips = trips.filter(trip => {
    if (filter !== 'ALL' && trip.status !== filter) return false;
    if (search && !trip.vehiclePlate.toLowerCase().includes(search.toLowerCase()) &&
        !trip.driverName.toLowerCase().includes(search.toLowerCase()) &&
        !trip.cargoDescription.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  return (
    <div className="space-y-6">
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Fleet</div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{FLEET_METRICS.totalTrucks}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Heavy trailers & lowbeds</div>
        </div>

        <div className={`p-4 rounded-2xl border border-l-4 border-l-blue-500 transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-blue-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            En Route
          </div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{trips.filter(t => t.status === 'IN_TRANSIT').length}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Streaming 5s GPS batches</div>
        </div>

        <div className={`p-4 rounded-2xl border border-l-4 border-l-amber-500 transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-amber-600 text-[11px] font-bold uppercase tracking-wider">Assigned / Loading</div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{trips.filter(t => t.status === 'ASSIGNED').length}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Permits & checks verified</div>
        </div>

        <div className={`p-4 rounded-2xl border border-l-4 border-l-emerald-500 transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Delivered Today</div>
          <div className={`text-2xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{trips.filter(t => t.status === 'DELIVERED').length}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Digital ePOD timestamped</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">On-Time Rate</div>
          <div className="text-emerald-600 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.onTimeRate}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">SLA benchmark</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">SQLite Buffer</div>
          <div className="text-amber-600 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.offlineBufferedSyncs}</div>
          <div className="text-slate-400 text-[10px] mt-0.5">Recovered from dead zones</div>
        </div>
      </div>

      {/* Main Operations Split View: Map + Vehicle Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Interactive UAE Telemetry Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[480px]">
            <InteractiveMap
              trips={trips}
              selectedTripId={selectedTripId}
              onSelectTrip={(trip) => setSelectedTripId(trip.id)}
              theme={theme}
            />
          </div>

          {/* Active Trip Telematics Bar */}
          {selectedTrip && (
            <div className={`rounded-2xl p-4 transition-colors ${
              isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-900 border border-slate-800 shadow-lg'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-black text-lg px-2.5 py-1 rounded border ${
                    isLight ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-950 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedTrip.vehiclePlate}
                  </span>
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedTrip.cargoDescription}</h3>
                    <p className="text-slate-500 text-xs">
                      Permit: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{selectedTrip.transportPermit}</span> • Gross: <strong className="text-slate-800 dark:text-slate-200">{selectedTrip.cargoWeightTon} Ton</strong>
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
              <h3 className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>FLEET VEHICLES</h3>
              <button 
                onClick={() => setShowDispatchModal(true)}
                className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Dispatch Trip
              </button>
            </div>

            {/* Filter pills */}
            <div className={`flex gap-1 mb-3 p-1 rounded-xl text-[11px] font-bold ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
              {(['ALL', 'IN_TRANSIT', 'ASSIGNED', 'AVAILABLE'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    filter === tab 
                      ? 'bg-white text-slate-950 shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'IN_TRANSIT' ? 'Transit' : tab === 'ASSIGNED' ? 'Assigned' : 'Yard'}
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
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => {
                const isSelected = trip.id === selectedTripId;
                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50/70 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                        : isLight
                          ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-950/60 border-slate-800/70 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-900 text-white border-slate-700'
                      }`}>
                        {trip.vehiclePlate}
                      </span>
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
                        {trip.status === 'IN_TRANSIT' ? `${trip.speedKmh} km/h • ${trip.etaMinutes}m ETA` : trip.vehicleType.split(' ')[0]}
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
                        <Eye className="w-3 h-3" />
                        Inspect Verified ePOD
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Trips Dispatch Table */}
      <div className={`rounded-2xl p-4 shadow-sm overflow-x-auto transition-colors ${
        isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800 shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>ACTIVE DISPATCH MANIFESTS</h3>
            <p className="text-slate-500 text-xs">Live telematics tracking with automated milestone capture</p>
          </div>
          <span className="text-xs font-mono text-slate-500">DATABASE: kasper_telemetry</span>
        </div>

        <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          <thead className={`uppercase font-mono text-[10px] border-b ${
            isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
          }`}>
            <tr>
              <th className="py-2.5 px-3">Trip ID</th>
              <th className="py-2.5 px-3">Vehicle / Driver</th>
              <th className="py-2.5 px-3">Cargo Spec</th>
              <th className="py-2.5 px-3">Origin ➔ Destination</th>
              <th className="py-2.5 px-3">Speed / Battery</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-sans ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
            {trips.map(trip => (
              <tr key={trip.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                <td className="py-3 px-3 font-mono font-bold text-amber-600">{trip.id}</td>
                <td className="py-3 px-3">
                  <div className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{trip.vehiclePlate}</div>
                  <div className="text-slate-500 text-[11px]">{trip.driverName}</div>
                </td>
                <td className="py-3 px-3">
                  <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{trip.cargoDescription}</div>
                  <div className="text-slate-400 text-[10px] font-mono">{trip.cargoWeightTon}T • {trip.cargoDimensions}</div>
                </td>
                <td className="py-3 px-3 max-w-[240px]">
                  <div className={`truncate font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>📍 {trip.originName.split(',')[0]}</div>
                  <div className="truncate text-slate-500 text-[11px]">🏁 {trip.destinationName.split(',')[0]}</div>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="text-blue-600 font-bold">{trip.speedKmh} km/h</div>
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-emerald-600" />
                    {trip.batteryPct}%
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    trip.status === 'IN_TRANSIT' ? 'bg-blue-500/15 text-blue-700 border border-blue-500/30' :
                    trip.status === 'ASSIGNED' ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30' :
                    trip.status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onSelectTripForCustomerView && (
                      <button
                        onClick={() => onSelectTripForCustomerView(trip.trackingToken)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Open Customer Live Tracking"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    {trip.epod?.signedAt && trip.status === 'DELIVERED' && (
                      <button
                        onClick={() => setInspectEpodTrip(trip)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors"
                        title="View Signed ePOD"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ePOD Inspection Modal */}
      {inspectEpodTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base">VERIFIED ELECTRONIC POD (ePOD)</h3>
              </div>
              <button
                onClick={() => setInspectEpodTrip(null)}
                className="text-slate-400 hover:text-slate-800 font-bold text-sm px-2.5 py-1 rounded-lg bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Consignment Number:</span>
                <span className="font-mono font-bold text-amber-700">{inspectEpodTrip.epod?.consignmentNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Delivered Vehicle:</span>
                <span className="font-mono font-bold text-slate-900">{inspectEpodTrip.vehiclePlate} ({inspectEpodTrip.driverName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cargo Description:</span>
                <span className="font-semibold text-slate-800">{inspectEpodTrip.cargoDescription}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receiver Name & Role:</span>
                <span className="font-bold text-emerald-700">{inspectEpodTrip.epod?.receiverName} ({inspectEpodTrip.epod?.receiverRole})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receiver Contact:</span>
                <span className="font-mono text-slate-700">{inspectEpodTrip.epod?.receiverPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">{inspectEpodTrip.epod?.signedAt}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Site Delivery Notes:</span>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 text-[11px] italic">
                  &ldquo;{inspectEpodTrip.epod?.deliveryNotes}&rdquo;
                </div>
              </div>
            </div>

            {/* Signature Preview Canvas */}
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-emerald-500/50">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                Cryptographically Timestamped Touch Signature
              </div>
              <div 
                className="w-full h-20 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: inspectEpodTrip.epod?.signatureUrl ? inspectEpodTrip.epod.signatureUrl.replace('data:image/svg+xml;utf8,', '') : '<div class="text-slate-400 italic">Signature Recorded</div>' }}
              />
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                SHA-256 SIGNATURE HASH VERIFIED • SITE GPS: 24.4821, 54.6041
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectEpodTrip(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch New Trip Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base">DISPATCH NEW HEAVY FREIGHT TRIP</h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-slate-800 font-bold text-sm px-2.5 py-1 rounded-lg bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Assign Available Vehicle & Driver:</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium">
                  <option>DXB-T-88219 (Bilal Hussain - 50ft Flatbed)</option>
                  <option>AUH-T-33901 (Farooq Ahmed - Telescopic Boom)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Cargo Spec & Machinery:</label>
                <input
                  type="text"
                  defaultValue="Komatsu PC200 Excavator"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Weight (Tons):</label>
                  <input
                    type="number"
                    defaultValue="21.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">RTA Permit Number:</label>
                  <input
                    type="text"
                    defaultValue="RTA-HAUL-2026-881"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Origin Pickup Yard:</label>
                <input
                  type="text"
                  defaultValue="Kasper Central Yard 12, Al Quoz, Dubai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Destination Construction Site:</label>
                <input
                  type="text"
                  defaultValue="Emaar South Golf Links Substation, Dubai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Trip KSP-TR-2045 dispatched to driver device. Tokenized public tracking link generated.');
                  setShowDispatchModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
