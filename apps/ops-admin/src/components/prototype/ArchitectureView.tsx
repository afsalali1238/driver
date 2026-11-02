'use client';

import React from 'react';
import { 
  Server, Shield, Database, Smartphone, Zap, 
  CheckCircle2, DollarSign, Layers, Activity 
} from './Icons';

interface ArchitectureViewProps {
  theme?: 'light' | 'dark';
}

export default function ArchitectureView({ theme = 'light' }: ArchitectureViewProps) {
  const isLight = theme === 'light';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Executive Highlights for the Founder */}
      <div className={`rounded-2xl p-6 shadow-md transition-colors ${
        isLight
          ? 'bg-white border border-slate-200 text-slate-900'
          : 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-slate-800 text-white shadow-2xl'
      }`}>
        <div className="flex items-center gap-2 text-amber-600 font-mono text-xs font-bold uppercase mb-2">
          <Zap className="w-4 h-4" />
          FOUNDER VALUE PROPOSITION
        </div>
        <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Why Kasper Eliminates Hardware GPS Trackers
        </h2>
        <p className={`text-sm mt-2 max-w-3xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Traditional heavy logistics relies on hardwired Teltonika GPS boxes costing <strong className="text-amber-600 font-bold">$1,500+ per truck</strong> plus recurring SIM telemetry contracts. When hiring 3rd-party contractor flatbeds, installing hardware is impossible. The Kasper Ecosystem replaces hardware with a lightweight driver app running a resilient foreground service, cutting hardware costs to <strong className="text-emerald-600 font-bold">$0</strong> while maintaining 99.9% telematics precision.
        </p>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-emerald-600 font-bold text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              100% Zero Hardware Cost
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Drivers use their existing smartphones. Fleet scales from 10 to 500 trucks on demand with zero installation downtime.
            </p>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-blue-600 font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Trip-Gated Driver Privacy
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              GPS records strictly between <code>START_TRIP</code> and <code>COMPLETE_EPOD</code>. Completely prevents driver pushback or off-duty tracking disputes.
            </p>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-amber-600 font-bold text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Dual-Process SQLite Offline
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              In remote UAE desert industrial corridors (Ruwais, Western Region), all breadcrumbs buffer locally and automatically flush when back in 4G/5G range.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Schematic */}
      <div className={`rounded-2xl p-6 shadow-md space-y-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
              TECHNICAL ARCHITECTURE TOPOLOGY
            </h3>
          </div>
          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            STANDALONE DISTRIBUTED RUNTIME
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Node 1: Mobile */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="text-amber-600 font-bold text-sm flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              DRIVER MOBILE
            </div>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Expo 52 + React Native
            </div>
            <ul className={`space-y-1 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>• Android Foreground Service</li>
              <li>• SQLite FIFO breadcrumb buffer</li>
              <li>• Multi-language (EN / AR / UR)</li>
              <li>• Digital signature canvas</li>
            </ul>
          </div>

          {/* Node 2: Telemetry API */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="text-blue-600 font-bold text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              TELEMETRY API
            </div>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Node.js 22 + Express
            </div>
            <ul className={`space-y-1 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>• Ingestion: <code>POST /batch</code></li>
              <li>• Redis pub/sub live fan-out</li>
              <li>• WebSocket <code>/ws/ops</code> stream</li>
              <li>• Role-based JWT validation</li>
            </ul>
          </div>

          {/* Node 3: Database */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="text-emerald-600 font-bold text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              POSTGRESQL 16
            </div>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              kasper_telemetry
            </div>
            <ul className={`space-y-1 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>• <code>telemetry_breadcrumbs</code></li>
              <li>• <code>v_active_fleet_status</code></li>
              <li>• BRIN temporal index on GPS</li>
              <li>• S3 ePOD signature vault</li>
            </ul>
          </div>

          {/* Node 4: Web Portals */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="text-purple-600 font-bold text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              WEB PORTALS
            </div>
            <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Next.js 15 + Tailwind
            </div>
            <ul className={`space-y-1 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              <li>• Ops Admin: Live Fleet Map</li>
              <li>• Public Tracking: <code>/track/:token</code></li>
              <li>• Leaflet directional icons</li>
              <li>• Dynamic ETA calculator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
