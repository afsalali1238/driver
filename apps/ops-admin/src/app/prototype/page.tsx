'use client';

import React, { useState, useEffect } from 'react';
import { DUMMY_TRIPS, TripData } from '../../data/dummyData';
import OpsAdminView from '../../components/prototype/OpsAdminView';
import DriverMobileView from '../../components/prototype/DriverMobileView';
import CustomerTrackingView from '../../components/prototype/CustomerTrackingView';
import ArchitectureView from '../../components/prototype/ArchitectureView';
import { 
  Truck, Radio, Smartphone, Search, ShieldCheck, 
  Layers, ExternalLink, Play, Pause, RotateCcw, 
  Sparkles, CheckCircle2, ChevronRight, Info
} from '../../components/prototype/Icons';

export default function PrototypeHubPage() {
  const [activeTab, setActiveTab] = useState<'OPS' | 'DRIVER' | 'CUSTOMER' | 'ARCH'>('OPS');
  const [trips, setTrips] = useState<TripData[]>(DUMMY_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<string>('KSP-TR-2041');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTick, setSimulationTick] = useState(0);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Simulation engine: nudges moving trucks along route and adjusts ETA
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationTick(prev => prev + 1);
        setTrips(prevTrips =>
          prevTrips.map(trip => {
            if (trip.status !== 'IN_TRANSIT') return trip;

            // Small movement increment towards destination
            const dLat = (trip.destinationCoords[0] - trip.currentCoords[0]) * 0.015;
            const dLng = (trip.destinationCoords[1] - trip.currentCoords[1]) * 0.015;
            
            const newLat = trip.currentCoords[0] + dLat;
            const newLng = trip.currentCoords[1] + dLng;

            const remainingKm = Math.max(0.5, +(trip.distanceRemainingKm - 0.4).toFixed(1));
            const newEta = Math.max(1, Math.round((remainingKm / (trip.speedKmh || 60)) * 60));

            return {
              ...trip,
              currentCoords: [newLat, newLng],
              distanceRemainingKm: remainingKm,
              etaMinutes: newEta,
              batteryPct: Math.max(15, trip.batteryPct - 0.05),
              speedKmh: Math.floor(62 + Math.random() * 12),
              routeTrail: [...trip.routeTrail, [newLat, newLng]]
            };
          })
        );
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleReset = () => {
    setIsSimulating(false);
    setTrips(DUMMY_TRIPS);
  };

  const handleTripStatusChange = (newStatus: TripData['status']) => {
    setTrips(prev =>
      prev.map(t => (t.id === selectedTripId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Founder Showcase Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider">KASPER</span>
                <span className="text-amber-400 font-bold text-xs tracking-widest font-mono">TELEMATICS</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  FOUNDER PROTOTYPE
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">UAE Heavy Transport & Driver Dispatch Ecosystem</div>
            </div>
          </div>

          {/* Master View Switcher Tabs */}
          <nav className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('OPS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'OPS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Ops Admin Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('DRIVER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'DRIVER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Driver Mobile App</span>
            </button>

            <button
              onClick={() => setActiveTab('CUSTOMER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'CUSTOMER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Customer Tracking</span>
            </button>

            <button
              onClick={() => setActiveTab('ARCH')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'ARCH'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture & ROI</span>
            </button>
          </nav>

          {/* Quick Active Scenario Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-400 hidden xl:inline">TRIP SCENARIO:</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.vehiclePlate} ({t.cargoDescription.split(' ')[0]}) - {t.status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Founder Pitch Helper Banner */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">Founder Demo Mode:</span>
            <span>Click <strong>&quot;Start Live Telemetry&quot;</strong> to watch vehicles move along Dubai-Abu Dhabi highways in real time. Switch between Ops, Driver Mobile, and Customer views seamlessly.</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">● Vercel-Ready Prototype</span>
            <span className="text-slate-600">|</span>
            <a href="/dashboard" className="text-amber-400 hover:underline">Switch to Real Telemetry Portal →</a>
          </div>
        </div>
      </div>

      {/* Main Showcase Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'OPS' && (
          <OpsAdminView
            trips={trips}
            onSelectTripForCustomerView={(token) => {
              const matched = trips.find(t => t.trackingToken === token);
              if (matched) setSelectedTripId(matched.id);
              setActiveTab('CUSTOMER');
            }}
            onSelectTripForDriverView={(tripId) => {
              setSelectedTripId(tripId);
              setActiveTab('DRIVER');
            }}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            onResetSimulation={handleReset}
          />
        )}

        {activeTab === 'DRIVER' && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-lg font-black text-white">Driver Mobile Application Simulator</h2>
              <p className="text-slate-400 text-xs mt-1">
                Field-tested for heavy haulage drivers. Test the interactive touch signature canvas, inspection checklist, language toggles, and offline SQLite buffering.
              </p>
            </div>
            <DriverMobileView
              trip={selectedTrip}
              onTripStatusChange={handleTripStatusChange}
            />
          </div>
        )}

        {activeTab === 'CUSTOMER' && (
          <CustomerTrackingView
            trip={selectedTrip}
            onOpenDriverSimulator={() => setActiveTab('DRIVER')}
          />
        )}

        {activeTab === 'ARCH' && (
          <ArchitectureView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Kasper Driver & Fleet Telematics Platform © 2026</span>
          <span>Designed for UAE Construction Logistics & Heavy Haulage</span>
          <span className="text-amber-400 font-bold">Vercel & Git Production Ready</span>
        </div>
      </footer>
    </div>
  );
}
