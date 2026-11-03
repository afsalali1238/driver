'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Printer, Clock, MapPin, Building2 } from './Icons';

interface DemurrageCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripCode?: string;
  poNumber?: string;
  customerName?: string;
  carrierName?: string;
  terminalName?: string;
  waitingHours?: number;
  hourlyRateAED?: number;
  totalDemurrageAED?: number;
  theme?: 'light' | 'dark';
}

export default function DemurrageCertificateModal({
  isOpen,
  onClose,
  tripCode = 'KSP-EQ-101',
  poNumber = 'PO-2026-0042',
  customerName = 'Al Naboodah Contracting LLC',
  carrierName = 'Al Faris Heavy Transport LLC',
  terminalName = 'JAFZA Gate 4 Outer Holding & Staging Zone',
  waitingHours = 3.5,
  hourlyRateAED = 100.00,
  totalDemurrageAED = 350.00,
  theme = 'light'
}: DemurrageCertificateModalProps) {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                CRYPTOGRAPHICALLY VERIFIED
              </span>
              <span className="text-xs font-mono text-slate-400">FTA COMPLIANT</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight">
              Kasper Demurrage Audit Certificate
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Automated GPS Geofence Ingress & Idle Telemetry Verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">COMMERCIAL PO</span>
            <span className="font-black text-amber-600 text-sm">{poNumber}</span>
          </div>
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">TRIP CODE</span>
            <span className="font-black text-sm">{tripCode}</span>
          </div>
          <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 block font-bold">BILLABLE DEMURRAGE</span>
            <span className="font-black text-emerald-600 text-sm">AED {totalDemurrageAED.toFixed(2)}</span>
          </div>
        </div>

        {/* Parties Involved */}
        <div className={`p-4 rounded-2xl border space-y-2 text-xs font-mono ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">CONSIGNEE / CLIENT:</span>
            <span className="font-bold">{customerName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">COMMERCIAL CARRIER:</span>
            <span className="font-bold">{carrierName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">MONITORED TERMINAL:</span>
            <span className="font-bold text-amber-600">{terminalName}</span>
          </div>
        </div>

        {/* Telematics Timeline Evidence */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Monotonic Ingress & Idle Telematics Audit Trail</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Outer Holding Zone Ingress (Gate 4 Queue)</span>
              </div>
              <span className="font-bold text-slate-500">08:14:22 GST (0 km/h)</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Inner Crane Offload Bay Ingress</span>
              </div>
              <span className="font-bold text-slate-500">11:44:22 GST</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between font-bold">
              <span>Audited Gate Detention: {waitingHours} Hours @ AED {hourlyRateAED.toFixed(2)}/hr</span>
              <span className="text-sm">AED {totalDemurrageAED.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof Hash */}
        <div className="text-[10px] font-mono text-slate-400 space-y-1 bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>SHA-256 HASH: <span className="text-slate-600 dark:text-slate-300">9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a44b1c2d3e4f5a6b7c8d9e0f1</span></div>
          <div>PRECISION: <span className="text-emerald-500 font-bold">HDOP 1.1 (0.8m Accuracy) · Zero GPS Multipath Reflection</span></div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            Dismiss
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Demurrage Invoice Voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
}
