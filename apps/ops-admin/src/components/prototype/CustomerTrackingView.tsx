'use client';

import React from 'react';
import { TripData } from '../../data/dummyData';
import InteractiveMap from './InteractiveMap';
import { 
  ShieldCheck, Clock, MapPin, Truck, CheckCircle2, 
  PhoneCall, AlertCircle, FileCheck, ExternalLink, ArrowRight 
} from './Icons';

interface CustomerTrackingViewProps {
  trip: TripData;
  onOpenDriverSimulator?: () => void;
  theme?: 'light' | 'dark';
}

export default function CustomerTrackingView({ 
  trip, 
  onOpenDriverSimulator,
  theme = 'light'
}: CustomerTrackingViewProps) {
  const isLight = theme === 'light';

  const steps = [
    { key: 'DISPATCHED', label: 'Dispatched from Yard', done: true, time: trip.startedAt },
    { key: 'IN_TRANSIT', label: 'In Transit on UAE Corridor', done: trip.status === 'IN_TRANSIT' || trip.status === 'ARRIVED_DESTINATION' || trip.status === 'DELIVERED', time: 'Active' },
    { key: 'ARRIVED_DESTINATION', label: 'Arrived at Project Site', done: trip.status === 'ARRIVED_DESTINATION' || trip.status === 'DELIVERED', time: trip.estimatedArrival },
    { key: 'DELIVERED', label: 'Signed Delivery Proof (ePOD)', done: trip.status === 'DELIVERED', time: trip.epod?.signedAt || 'Pending' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className={`rounded-2xl p-6 shadow-md relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border border-slate-200 text-slate-900'
          : 'bg-slate-900 border border-slate-800 text-white'
      }`}>
        {/* Amber accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-600 tracking-wider">LIVE TELEMATICS STREAM</span>
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>|</span>
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>REF: {trip.id}</span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Kasper Heavy Freight Tracking
            </h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Consignee Tracking Token: <span className={`font-mono px-2 py-0.5 rounded text-xs font-semibold ${
                isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-800 text-slate-300'
              }`}>{trip.trackingToken}</span>
            </p>
          </div>

          {/* Dynamic ETA Pill */}
          <div className={`rounded-xl px-4 py-3 text-right border ${
            isLight
              ? 'bg-amber-50/80 border-amber-300 shadow-sm'
              : 'bg-slate-950/90 border-amber-500/40'
          }`}>
            <div className={`text-[10px] font-mono uppercase flex items-center justify-end gap-1 ${
              isLight ? 'text-amber-800 font-bold' : 'text-slate-400'
            }`}>
              <Clock className="w-3 h-3 text-amber-600" />
              ESTIMATED ARRIVAL
            </div>
            <div className="text-xl font-black text-amber-600 font-mono mt-0.5">
              {trip.status === 'DELIVERED' ? 'DELIVERED' : `~${trip.etaMinutes} MINS`}
            </div>
            <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {trip.status === 'DELIVERED' ? 'Signed at Site' : `${trip.distanceRemainingKm} km remaining`}
            </div>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className={`mt-8 pt-6 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={step.key} className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done 
                      ? 'bg-emerald-600 text-white' 
                      : isLight ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${
                    step.done 
                      ? (isLight ? 'text-slate-900' : 'text-white') 
                      : (isLight ? 'text-slate-400' : 'text-slate-500')
                  }`}>
                    {step.label}
                  </span>
                </div>
                <div className={`text-[10px] font-mono pl-8 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Map Section */}
      <div className={`h-[420px] rounded-2xl overflow-hidden shadow-md border ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <InteractiveMap
          trips={[trip]}
          selectedTripId={trip.id}
          className="rounded-2xl"
          theme={theme}
        />
      </div>

      {/* If Delivered: Stamped Photo ePOD Verification Card */}
      {trip.status === 'DELIVERED' && trip.epod && (
        <div className={`rounded-2xl p-4 border shadow-sm space-y-3 transition-colors ${
          isLight ? 'bg-emerald-50/70 border-emerald-300 text-slate-900' : 'bg-emerald-950/30 border-emerald-800 text-emerald-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </span>
              <div>
                <h3 className="font-black text-sm text-emerald-900 dark:text-emerald-200">Electronic Proof of Delivery (ePOD) Verified</h3>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">Ref: {trip.epod.consignmentNumber} • {trip.epod.signedAt}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
              STAMPED & SIGNED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Stamped DO Graphic */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 font-bold uppercase">1. Physical Stamped Delivery Note Photo</div>
              <div className="border border-dashed border-rose-300 bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-lg text-center relative overflow-hidden">
                <div className="text-[9.5px] font-mono font-bold text-slate-800 dark:text-slate-200">AL NABOODAH CONTRACTING LLC</div>
                <div className="text-[8px] text-slate-500">SITE DELIVERY NOTE #{trip.epod.consignmentNumber}</div>
                <div className="my-1.5 py-0.5 px-2.5 border-2 border-dashed border-rose-600 text-rose-600 font-black text-[9px] inline-block -rotate-2 rounded">
                  ★ RECEIVED & STAMPED ★
                </div>
                <div className="text-[8px] font-mono text-slate-600 dark:text-slate-400">Signed by: {trip.epod.receiverName}</div>
              </div>
              <div className="text-[8px] font-mono text-slate-400 flex justify-between">
                <span>📍 GPS Watermarked</span>
                <span className="text-emerald-600 font-bold">Tamper-Proof ✓</span>
              </div>
            </div>

            {/* Offloaded Machine Graphic */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 font-bold uppercase">2. On-Site Cargo Offload Photo</div>
              <div className="bg-slate-100 dark:bg-slate-800 h-24 rounded-lg flex flex-col items-center justify-center text-center p-2">
                <span className="text-xl">🚜</span>
                <span className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{trip.cargoDescription.split(' ')[0]} Placed Safely at Site Bay</span>
                <span className="text-[8px] text-emerald-600 font-mono font-bold mt-0.5">No Mechanical Damage • Offload Clean</span>
              </div>
              <div className="text-[8px] font-mono text-slate-400 text-right">
                Site Logistics Inspected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cargo & Site Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cargo Card */}
        <div className={`rounded-xl p-4 space-y-3 border shadow-sm transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono text-amber-600 font-bold uppercase">
            <span>Cargo Manifest</span>
            <span>Permit: {trip.transportPermit}</span>
          </div>
          <div className={`font-black text-base leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {trip.cargoDescription}
          </div>
          <div className={`grid grid-cols-2 gap-2 text-xs pt-2 border-t font-mono ${
            isLight ? 'border-slate-100' : 'border-slate-800'
          }`}>
            <div>
              <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>GROSS WEIGHT</span>
              <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{trip.cargoWeightTon} Metric Tons</strong>
            </div>
            <div>
              <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>DIMENSIONS</span>
              <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{trip.cargoDimensions}</strong>
            </div>
            <div>
              <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>CARRIER VEHICLE</span>
              <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{trip.vehiclePlate} ({trip.vehicleType.split(' ')[0]})</strong>
            </div>
            <div>
              <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>TELEMETRY INTERVAL</span>
              <strong className="text-emerald-600 font-bold">5-Second Live Sync</strong>
            </div>
          </div>
        </div>

        {/* Site Delivery Card */}
        <div className={`rounded-xl p-4 space-y-3 border shadow-sm transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono text-emerald-600 font-bold uppercase">
            <span>Delivery Destination</span>
            <span>Consignee Verified</span>
          </div>
          <div className={`font-black text-base leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {trip.destinationName}
          </div>
          <div className={`space-y-1.5 text-xs pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Designated Site Receiver:</span>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{trip.epod?.receiverName || 'Site Engineer'}</span>
            </div>
            <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Privacy Shield:</span>
              <span className="text-emerald-600 font-mono text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Driver Number Protected
              </span>
            </div>
            <div className="pt-2">
              <a
                href="tel:+971800KASPER"
                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                  isLight 
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                Contact 24/7 Heavy Haulage Dispatch (800-KASPER)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
