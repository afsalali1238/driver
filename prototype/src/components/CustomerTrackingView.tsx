'use client';

import React from 'react';
import { TripData } from '../data/dummyData';
import InteractiveMap from './InteractiveMap';
import { 
  ShieldCheck, Clock, MapPin, Truck, CheckCircle2, 
  PhoneCall, AlertCircle, FileCheck, ExternalLink, ArrowRight 
} from './Icons';

interface CustomerTrackingViewProps {
  trip: TripData;
  onOpenDriverSimulator?: () => void;
}

export default function CustomerTrackingView({ trip, onOpenDriverSimulator }: CustomerTrackingViewProps) {
  const steps = [
    { key: 'DISPATCHED', label: 'Dispatched from Yard', done: true, time: trip.startedAt },
    { key: 'IN_TRANSIT', label: 'In Transit on UAE Corridor', done: trip.status === 'IN_TRANSIT' || trip.status === 'ARRIVED_DESTINATION' || trip.status === 'DELIVERED', time: 'Active' },
    { key: 'ARRIVED_DESTINATION', label: 'Arrived at Project Site', done: trip.status === 'ARRIVED_DESTINATION' || trip.status === 'DELIVERED', time: trip.estimatedArrival },
    { key: 'DELIVERED', label: 'Signed Delivery Proof (ePOD)', done: trip.status === 'DELIVERED', time: trip.epod?.signedAt || 'Pending' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Amber accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">LIVE TELEMATICS STREAM</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-mono text-slate-400">REF: {trip.id}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kasper Heavy Freight Tracking</h1>
            <p className="text-slate-400 text-xs mt-1">Consignee Tracking Token: <span className="font-mono text-slate-300">{trip.trackingToken}</span></p>
          </div>

          {/* Dynamic ETA Pill */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl px-4 py-3 text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              ESTIMATED ARRIVAL
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
              {trip.status === 'DELIVERED' ? 'DELIVERED' : `~${trip.etaMinutes} MINS`}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {trip.status === 'DELIVERED' ? 'Signed at Site' : `${trip.distanceRemainingKm} km remaining`}
            </div>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={step.key} className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pl-8">
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Map Section */}
      <div className="h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <InteractiveMap
          trips={[trip]}
          selectedTripId={trip.id}
          className="rounded-2xl"
        />
      </div>

      {/* Cargo & Site Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cargo Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold uppercase">
            <span>Cargo Manifest</span>
            <span>Permit: {trip.transportPermit}</span>
          </div>
          <div className="text-white font-bold text-base leading-snug">
            {trip.cargoDescription}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">GROSS WEIGHT</span>
              <strong className="text-slate-200">{trip.cargoWeightTon} Metric Tons</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DIMENSIONS</span>
              <strong className="text-slate-200">{trip.cargoDimensions}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CARRIER VEHICLE</span>
              <strong className="text-slate-200">{trip.vehiclePlate} ({trip.vehicleType.split(' ')[0]})</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TELEMETRY INTERVAL</span>
              <strong className="text-emerald-400">5-Second Live Sync</strong>
            </div>
          </div>
        </div>

        {/* Site Delivery Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold uppercase">
            <span>Delivery Destination</span>
            <span>Consignee Verified</span>
          </div>
          <div className="text-white font-bold text-base leading-snug">
            {trip.destinationName}
          </div>
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Designated Site Receiver:</span>
              <span className="font-semibold text-white">{trip.epod?.receiverName || 'Site Engineer'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Privacy Shield:</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Driver Number Protected
              </span>
            </div>
            <div className="pt-2">
              <a
                href="tel:+971800KASPER"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors"
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
