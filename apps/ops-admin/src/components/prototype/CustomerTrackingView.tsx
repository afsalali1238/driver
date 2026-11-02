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
