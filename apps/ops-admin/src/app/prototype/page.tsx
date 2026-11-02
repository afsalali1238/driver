'use client';

import React, { useState, useEffect } from 'react';
import { DUMMY_TRIPS, TripData, FLEET_METRICS } from '../../data/dummyData';
import OpsAdminView from '../../components/prototype/OpsAdminView';
import DriverMobileView from '../../components/prototype/DriverMobileView';
import CustomerTrackingView from '../../components/prototype/CustomerTrackingView';
import ArchitectureView from '../../components/prototype/ArchitectureView';
import { 
  Truck, Radio, Smartphone, Search, ShieldCheck, 
  Layers, ExternalLink, Play, Pause, RotateCcw, 
  Sparkles, CheckCircle2, ChevronRight, Info,
  ArrowRight, Globe, Zap, ArrowLeft, LayoutGrid
} from '../../components/prototype/Icons';

type ActiveView = 'LAUNCHPAD' | 'OPS' | 'DRIVER' | 'CUSTOMER' | 'ARCH';

export default function PrototypeHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveView>('LAUNCHPAD');
  const [trips, setTrips] = useState<TripData[]>(DUMMY_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<string>('KSP-TR-2041');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTick, setSimulationTick] = useState(0);

  // Sync initial tab with URL query parameter ?app=driver | admin | customer | launchpad
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const app = params.get('app');
      if (app === 'driver') setActiveTab('DRIVER');
      else if (app === 'admin' || app === 'ops') setActiveTab('OPS');
      else if (app === 'customer' || app === 'track') setActiveTab('CUSTOMER');
      else if (app === 'arch' || app === 'specs') setActiveTab('ARCH');
      else setActiveTab('LAUNCHPAD');
    }
  }, []);

  const switchTab = (tab: ActiveView) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'LAUNCHPAD') {
        url.searchParams.delete('app');
      } else {
        const slug = tab === 'OPS' ? 'admin' : tab === 'DRIVER' ? 'driver' : tab === 'CUSTOMER' ? 'customer' : 'specs';
        url.searchParams.set('app', slug);
      }
      window.history.replaceState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans pb-24 overflow-x-hidden">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => switchTab('LAUNCHPAD')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider">KASPER</span>
                <span className="text-amber-400 font-bold text-xs tracking-widest font-mono">ECOSYSTEM</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  FOUNDER DEMO
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">UAE Heavy Transport & Driver Telematics Platform</div>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <nav className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => switchTab('LAUNCHPAD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'LAUNCHPAD'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>All Apps</span>
            </button>

            <button
              onClick={() => switchTab('DRIVER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'DRIVER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Driver App</span>
            </button>

            <button
              onClick={() => switchTab('OPS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'OPS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => switchTab('CUSTOMER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'CUSTOMER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Customer Track</span>
            </button>

            <button
              onClick={() => switchTab('ARCH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ARCH'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Specs & ROI</span>
            </button>
          </nav>

          {/* Quick Active Scenario Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-400 hidden xl:inline">FREIGHT CARGO:</label>
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">

        {/* ======================================================== */}
        {/* VIEW 0: EXECUTIVE APP LAUNCHPAD (DEFAULT LANDING) */}
        {/* ======================================================== */}
        {activeTab === 'LAUNCHPAD' && (
          <div className="space-y-8 py-4">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                FOUNDER SHOWCASE PORTAL
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Kasper Fleet & Driver Telematics Ecosystem
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Zero hardware GPS dependency. Eliminates $1,500/truck hardwired Teltonika boxes with offline-first driver smartphones, live dispatch telematics, and cryptographic ePOD sign-offs.
              </p>
            </div>

            {/* Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              
              {/* Card 1: Driver Mobile App */}
              <div 
                onClick={() => switchTab('DRIVER')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                      INTERACTIVE SIMULATOR
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    Driver Mobile App
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Smartphone app for heavy transport drivers. Features large touch buttons, camera watermark photo capture, interactive touchscreen signature canvas, Arabic/Urdu/English localization, and offline SQLite buffering.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ePOD Touch Signature</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>EN / AR / UR Toggle</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SQLite Offline Buffer</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Trip-Gated GPS Privacy</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">Try iPhone simulator & signature canvas</span>
                  <button className="px-4 py-2 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20">
                    Launch Driver App ➔
                  </button>
                </div>
              </div>

              {/* Card 2: Ops Admin Dashboard */}
              <div 
                onClick={() => switchTab('OPS')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Radio className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                      LIVE FLEET TELEMATICS
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    Ops Admin Dashboard
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Mission control for logistics dispatchers. Interactive UAE map tracking heavy equipment across Dubai, Abu Dhabi, and Sharjah with directional heading icons, speed alerts, and digital consignment archive.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>UAE Corridor Map (E11)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Speed & Heading</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Verified ePOD Archive</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>One-Click Dispatch</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-blue-400 font-bold">Interactive fleet telemetry & live dispatch</span>
                  <button className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                    Launch Admin Portal ➔
                  </button>
                </div>
              </div>

              {/* Card 3: Customer Live Tracking */}
              <div 
                onClick={() => switchTab('CUSTOMER')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Search className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                      TOKENIZED PUBLIC LINK
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    Customer Tracking Surface
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Zero-login tracking page sent to EPC contractors, site engineers, and project managers. Live vehicle map, dynamic ETA countdown, and driver privacy shielding.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold">Client-facing live delivery experience</span>
                  <button className="px-4 py-2 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-white font-bold text-xs">
                    View Tracking Link ➔
                  </button>
                </div>
              </div>

              {/* Card 4: Architecture & ROI */}
              <div 
                onClick={() => switchTab('ARCH')}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Layers className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
                      ARCHITECTURE & ROI
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    System Specs & Founder ROI
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Executive breakdown of the dual-process Android foreground service, offline FIFO database buffering, backend Node/Postgres stack, and hardware cost savings.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-purple-400 font-bold">Technical topology & business model</span>
                  <button className="px-4 py-2 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-white font-bold text-xs">
                    Read Architecture ➔
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Back Button Banner when viewing a specific app */}
        {activeTab !== 'LAUNCHPAD' && (
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs">
            <button
              onClick={() => switchTab('LAUNCHPAD')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>← Back to All Apps Launchpad</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 hidden sm:inline">Viewing:</span>
              <span className="font-bold text-amber-400 font-mono">
                {activeTab === 'OPS' ? '🖥️ Admin Dashboard' : activeTab === 'DRIVER' ? '🚚 Driver Mobile App' : activeTab === 'CUSTOMER' ? '🔍 Customer Tracking' : '🏗️ Architecture Specs'}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: OPS ADMIN VIEW */}
        {/* ======================================================== */}
        {activeTab === 'OPS' && (
          <OpsAdminView
            trips={trips}
            onSelectTripForCustomerView={(token) => {
              const matched = trips.find(t => t.trackingToken === token);
              if (matched) setSelectedTripId(matched.id);
              switchTab('CUSTOMER');
            }}
            onSelectTripForDriverView={(tripId) => {
              setSelectedTripId(tripId);
              switchTab('DRIVER');
            }}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            onResetSimulation={handleReset}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DRIVER MOBILE APP SIMULATOR (WITH FULL SCROLL) */}
        {/* ======================================================== */}
        {activeTab === 'DRIVER' && (
          <div className="space-y-4 pb-12">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                <Smartphone className="w-6 h-6 text-amber-400" />
                Driver Mobile Application Simulator
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Optimized for heavy freight field drivers. Scroll down to test the active trip stage progression, interactive touch signature canvas, inspection audit, and offline SQLite buffering!
              </p>
            </div>
            <DriverMobileView
              trip={selectedTrip}
              onTripStatusChange={handleTripStatusChange}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: CUSTOMER LIVE TRACKING */}
        {/* ======================================================== */}
        {activeTab === 'CUSTOMER' && (
          <CustomerTrackingView
            trip={selectedTrip}
            onOpenDriverSimulator={() => switchTab('DRIVER')}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: ARCHITECTURE & ROI */}
        {/* ======================================================== */}
        {activeTab === 'ARCH' && (
          <ArchitectureView />
        )}
      </main>

      {/* Floating Bottom Quick-Switcher Pill (Always Visible on Screen) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-1.5 rounded-full shadow-2xl flex items-center gap-1 text-xs font-bold ring-1 ring-slate-800">
        <button
          onClick={() => switchTab('LAUNCHPAD')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            activeTab === 'LAUNCHPAD' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
          <span>Launchpad</span>
        </button>

        <button
          onClick={() => switchTab('DRIVER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            activeTab === 'DRIVER' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Driver App</span>
        </button>

        <button
          onClick={() => switchTab('OPS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            activeTab === 'OPS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>

        <button
          onClick={() => switchTab('CUSTOMER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            activeTab === 'CUSTOMER' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Customer Link</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Kasper Driver & Fleet Telematics Platform © 2026</span>
          <span>Access both Driver App and Admin Portal from one unified link</span>
          <span className="text-amber-400 font-bold">Vercel Production Deployment</span>
        </div>
      </footer>
    </div>
  );
}
