'use client';

import React, { useState } from 'react';
import { TripData, FLEET_METRICS } from '../data/dummyData';
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
}

export default function OpsAdminView({
  trips,
  onSelectTripForCustomerView,
  onSelectTripForDriverView,
  isSimulating,
  onToggleSimulation,
  onResetSimulation
}: OpsAdminViewProps) {
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base tracking-wide">KASPER OPS TELEMATICS DISPATCH</h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                STANDALONE NODE & POSTGRES
              </span>
            </div>
            <p className="text-slate-400 text-xs">Trip-Gated Privacy Architecture • Dual-Process SQLite Buffer • Zero Teltonika Hardware</p>
          </div>
        </div>

        {/* Live Simulation Control Panel for Founder Demo */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-mono">SIMULATION:</span>
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Pause Stream' : 'Start Live Telemetry'}
          </button>
          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset telemetry positions to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Total Fleet</div>
          <div className="text-white text-2xl font-black mt-1 font-mono">{FLEET_METRICS.totalTrucks}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Heavy trailers & lowbeds</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 border-l-4 border-l-blue-500">
          <div className="text-blue-400 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            En Route
          </div>
          <div className="text-white text-2xl font-black mt-1 font-mono">{trips.filter(t => t.status === 'IN_TRANSIT').length}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Streaming 5s GPS batches</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 border-l-4 border-l-amber-500">
          <div className="text-amber-400 text-[11px] font-medium uppercase tracking-wider">Assigned / Loading</div>
          <div className="text-white text-2xl font-black mt-1 font-mono">{trips.filter(t => t.status === 'ASSIGNED').length}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Permits & pre-checks verified</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 border-l-4 border-l-emerald-500">
          <div className="text-emerald-400 text-[11px] font-medium uppercase tracking-wider">Delivered Today</div>
          <div className="text-white text-2xl font-black mt-1 font-mono">{trips.filter(t => t.status === 'DELIVERED').length}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Digital ePOD timestamped</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">On-Time Rate</div>
          <div className="text-emerald-400 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.onTimeRate}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">SLA compliance benchmark</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">SQLite Offline Buffer</div>
          <div className="text-amber-400 text-2xl font-black mt-1 font-mono">{FLEET_METRICS.offlineBufferedSyncs}</div>
          <div className="text-slate-500 text-[10px] mt-0.5">Zero data lost in dead zones</div>
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
            />
          </div>

          {/* Active Trip Telematics Bar */}
          {selectedTrip && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-amber-400 text-lg px-2.5 py-1 bg-slate-950 rounded border border-amber-500/30">
                    {selectedTrip.vehiclePlate}
                  </span>
                  <div>
                    <h3 className="text-white font-bold text-sm">{selectedTrip.cargoDescription}</h3>
                    <p className="text-slate-400 text-xs">
                      Permit: <span className="font-mono text-slate-300">{selectedTrip.transportPermit}</span> • Gross: <strong className="text-slate-200">{selectedTrip.cargoWeightTon} Ton</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectTripForDriverView && (
                    <button
                      onClick={() => onSelectTripForDriverView(selectedTrip.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      View in Driver App
                    </button>
                  )}
                  {onSelectTripForCustomerView && (
                    <button
                      onClick={() => onSelectTripForCustomerView(selectedTrip.trackingToken)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Customer Live Link
                    </button>
                  )}
                </div>
              </div>

              {/* Waypoint Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    ORIGIN YARD / PICKUP
                  </div>
                  <div className="text-slate-200 font-medium">{selectedTrip.originName}</div>
                  <div className="text-slate-500 font-mono text-[10px] mt-1">
                    COORDS: {selectedTrip.originCoords[0].toFixed(4)}, {selectedTrip.originCoords[1].toFixed(4)}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-rose-400 font-bold flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    DESTINATION SITE
                  </div>
                  <div className="text-slate-200 font-medium">{selectedTrip.destinationName}</div>
                  <div className="text-slate-500 font-mono text-[10px] mt-1">
                    COORDS: {selectedTrip.destinationCoords[0].toFixed(4)}, {selectedTrip.destinationCoords[1].toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Fleet Vehicle Roster */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm tracking-wide">FLEET VEHICLES</h3>
              <button 
                onClick={() => setShowDispatchModal(true)}
                className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Dispatch Trip
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1 mb-3 text-[11px] font-semibold">
              {(['ALL', 'IN_TRANSIT', 'ASSIGNED', 'AVAILABLE'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-1 rounded transition-colors ${
                    filter === tab 
                      ? 'bg-slate-800 text-white font-bold border border-slate-700' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'IN_TRANSIT' ? 'Transit' : tab === 'ASSIGNED' ? 'Assigned' : 'Yard'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search plate, driver, cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
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
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800/70 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-slate-900 rounded border border-slate-700">
                        {trip.vehiclePlate}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        trip.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        trip.status === 'ASSIGNED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        trip.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="text-slate-300 font-medium text-xs truncate">
                      {trip.cargoDescription}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                      <span>👤 {trip.driverName}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {trip.status === 'IN_TRANSIT' ? `${trip.speedKmh} km/h • ${trip.etaMinutes}m ETA` : trip.vehicleType.split(' ')[0]}
                      </span>
                    </div>

                    {trip.epod?.signedAt && trip.status === 'DELIVERED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEpodTrip(trip);
                        }}
                        className="mt-2 w-full py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1"
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide">ACTIVE DISPATCH MANIFESTS</h3>
            <p className="text-slate-400 text-xs">Live telematics tracking with automated milestone capture</p>
          </div>
          <span className="text-xs font-mono text-slate-400">DATABASE: kasper_telemetry</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {trips.map(trip => (
              <tr key={trip.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-amber-400">{trip.id}</td>
                <td className="py-3 px-3">
                  <div className="font-mono font-bold text-white">{trip.vehiclePlate}</div>
                  <div className="text-slate-400 text-[11px]">{trip.driverName}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-slate-200 font-medium">{trip.cargoDescription}</div>
                  <div className="text-slate-500 text-[10px] font-mono">{trip.cargoWeightTon}T • {trip.cargoDimensions}</div>
                </td>
                <td className="py-3 px-3 max-w-[240px]">
                  <div className="truncate text-slate-300 font-medium">📍 {trip.originName.split(',')[0]}</div>
                  <div className="truncate text-slate-400 text-[11px]">🏁 {trip.destinationName.split(',')[0]}</div>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="text-blue-400 font-bold">{trip.speedKmh} km/h</div>
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-emerald-400" />
                    {trip.batteryPct}%
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    trip.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    trip.status === 'ASSIGNED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    trip.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onSelectTripForCustomerView && (
                      <button
                        onClick={() => onSelectTripForCustomerView(trip.trackingToken)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Open Customer Live Tracking"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    {trip.epod?.signedAt && trip.status === 'DELIVERED' && (
                      <button
                        onClick={() => setInspectEpodTrip(trip)}
                        className="p-1.5 rounded hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-bold text-base">VERIFIED ELECTRONIC POD (ePOD)</h3>
              </div>
              <button
                onClick={() => setInspectEpodTrip(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Consignment Number:</span>
                <span className="font-mono font-bold text-amber-400">{inspectEpodTrip.epod?.consignmentNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Delivered Vehicle:</span>
                <span className="font-mono font-bold text-white">{inspectEpodTrip.vehiclePlate} ({inspectEpodTrip.driverName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cargo Description:</span>
                <span className="font-medium text-slate-200">{inspectEpodTrip.cargoDescription}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Receiver Name & Role:</span>
                <span className="font-bold text-emerald-400">{inspectEpodTrip.epod?.receiverName} ({inspectEpodTrip.epod?.receiverRole})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Receiver Contact:</span>
                <span className="font-mono text-slate-300">{inspectEpodTrip.epod?.receiverPhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">{inspectEpodTrip.epod?.signedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Site Delivery Notes:</span>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-300 text-[11px] italic">
                  &ldquo;{inspectEpodTrip.epod?.deliveryNotes}&rdquo;
                </div>
              </div>
            </div>

            {/* Signature Preview Canvas */}
            <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center border-2 border-emerald-500/50">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                Cryptographically Timestamped Touch Signature
              </div>
              <div 
                className="w-full h-20 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: inspectEpodTrip.epod?.signatureUrl ? inspectEpodTrip.epod.signatureUrl.replace('data:image/svg+xml;utf8,', '') : '<div class="text-slate-400 italic">Signature Recorded</div>' }}
              />
              <div className="text-[9px] text-slate-400 font-mono mt-1">
                SHA-256 SIGNATURE HASH VERIFIED • SITE GPS: 24.4821, 54.6041
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectEpodTrip(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch New Trip Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-base">DISPATCH NEW HEAVY FREIGHT TRIP</h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Assign Available Vehicle & Driver:</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option>DXB-T-88219 (Bilal Hussain - 50ft Flatbed)</option>
                  <option>AUH-T-33901 (Farooq Ahmed - Telescopic Boom)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cargo Spec & Machinery:</label>
                <input
                  type="text"
                  defaultValue="Komatsu PC200 Excavator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Weight (Tons):</label>
                  <input
                    type="number"
                    defaultValue="21.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">RTA Permit Number:</label>
                  <input
                    type="text"
                    defaultValue="RTA-HAUL-2026-881"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Origin Pickup Yard:</label>
                <input
                  type="text"
                  defaultValue="Kasper Central Yard 12, Al Quoz, Dubai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Construction Site:</label>
                <input
                  type="text"
                  defaultValue="Emaar South Golf Links Substation, Dubai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Trip KSP-TR-2045 dispatched to driver device. Tokenized public tracking link generated.');
                  setShowDispatchModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
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
