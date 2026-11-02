'use client';

import { useState } from 'react';
import { FleetVehicle } from '@/lib/store';

interface TripDetailDrawerProps {
  vehicle: FleetVehicle | null;
  onClose: () => void;
}

export function TripDetailDrawer({ vehicle, onClose }: TripDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!vehicle) return null;

  const trackingUrl = vehicle.trackingToken
    ? `https://kasper.ae/track/${vehicle.trackingToken}`
    : null;

  const handleCopyLink = () => {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'IN_TRANSIT' || status === 'EN_ROUTE_PICKUP') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          In Transit
        </span>
      );
    }
    if (status === 'ASSIGNED') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
          Assigned
        </span>
      );
    }
    if (status === 'AVAILABLE') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          Available in Yard
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-96 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-100px)] animate-in fade-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black tracking-wider text-white bg-gray-700/80 px-2 py-0.5 rounded border border-gray-600">
              {vehicle.vehiclePlate}
            </span>
            <span className="text-xs text-gray-300 font-medium truncate max-w-[140px]">
              {vehicle.vehicleCategory || 'Heavy Equipment'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {getStatusBadge(vehicle.tripStatus)}
            <span className="text-[11px] text-gray-300">
              {vehicle.speedKmh > 0 ? `${vehicle.speedKmh.toFixed(1)} km/h` : 'Parked'}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          title="Close details"
        >
          ✕
        </button>
      </div>

      {/* Body scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Client & Customer Block */}
        <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
              🏢 Client / Customer
            </span>
            <span className="text-[10px] bg-sky-200/60 text-sky-900 font-semibold px-2 py-0.5 rounded">
              Verified Account
            </span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            {vehicle.customerName || 'Direct Logistics Contractor'}
          </div>
          {vehicle.customerPhone && (
            <div className="flex items-center justify-between pt-1 text-gray-600">
              <span>Site Contact Phone:</span>
              <a
                href={`tel:${vehicle.customerPhone}`}
                className="font-mono font-medium text-sky-700 hover:underline"
              >
                {vehicle.customerPhone}
              </a>
            </div>
          )}

          {/* Customer Live Tracking Link */}
          {trackingUrl && (
            <div className="pt-2 border-t border-sky-200/60 flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-white hover:bg-sky-100 text-sky-800 font-medium py-1.5 px-3 rounded-lg border border-sky-300 text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? '✓ Link Copied!' : '📋 Copy Client Live Map Link'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Track your equipment delivery live: ${trackingUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-sm"
              >
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Trip & Route Specs */}
        {vehicle.tripCode && vehicle.tripCode !== 'IDLE (Yard)' ? (
          <div className="border border-gray-200 rounded-xl p-3.5 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Trip Code</span>
                <div className="font-mono font-bold text-gray-900 text-sm">
                  {vehicle.tripCode}
                </div>
              </div>
              {vehicle.cargoTitle && (
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Cargo</span>
                  <div className="font-semibold text-gray-800 max-w-[160px] truncate">
                    {vehicle.cargoTitle}
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-step route */}
            <div className="space-y-2.5 relative pl-4 border-l-2 border-primary-200 ml-1">
              <div>
                <div className="text-[10px] font-bold text-primary-700 uppercase">
                  🚩 Origin / Pickup Yard
                </div>
                <div className="font-medium text-gray-800 text-xs mt-0.5">
                  {vehicle.originAddress || 'Central Dispatch Yard (Sharjah)'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  📍 Current Live Position
                </div>
                <div className="font-mono text-gray-600 text-[11px] mt-0.5">
                  {vehicle.lat.toFixed(4)}° N, {vehicle.lon.toFixed(4)}° E
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Speed: {vehicle.speedKmh.toFixed(1)} km/h · Heading: {vehicle.bearing.toFixed(0)}°
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-red-700 uppercase">
                  🏁 Destination / Project Site
                </div>
                <div className="font-medium text-gray-800 text-xs mt-0.5">
                  {vehicle.destinationAddress || 'Site Delivery Location'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 bg-gray-50/50">
            <p>Vehicle currently idle in yard with no active dispatch trip.</p>
          </div>
        )}

        {/* Mandatory Driver Mobile App Status */}
        <div className="border border-gray-200 rounded-xl p-3.5 space-y-2 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              📱 Mandatory Driver App
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                vehicle.appComplianceStatus === 'COMPLIANT'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {vehicle.appComplianceStatus === 'COMPLIANT' ? '✓ ENROLLED & ACTIVE' : '⚠️ APP REQUIRED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-white p-2 rounded border border-gray-100">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">App Telemetry</span>
              <span className="font-medium text-gray-800">
                {vehicle.health === 'LIVE' ? '🟢 Live Background GPS' : '🟡 Delayed Ping'}
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-gray-100">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Phone Battery</span>
              <span className="font-medium text-gray-800">
                ⚡ {vehicle.batteryPercentage ?? 100}% Health
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Driver Profile */}
        <div className="border border-gray-200 rounded-xl p-3.5 space-y-2 bg-white">
          <div className="text-[10px] text-gray-400 uppercase font-bold">Assigned Driver</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900 text-sm">{vehicle.driverName}</div>
              <a
                href={`tel:${vehicle.driverPhone}`}
                className="font-mono text-primary-600 hover:underline text-xs"
              >
                {vehicle.driverPhone}
              </a>
            </div>
            <a
              href={`tel:${vehicle.driverPhone}`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              📞 Call Driver
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
