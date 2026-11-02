'use client';

import { useState } from 'react';
import { FleetVehicle } from '@/lib/store';

interface VehicleListProps {
  vehicles: FleetVehicle[];
  selectedTripId?: string | null;
  selectedDriverId?: string | null;
  onVehicleClick: (vehicle: FleetVehicle) => void;
}

export function VehicleList({
  vehicles,
  selectedTripId,
  selectedDriverId,
  onVehicleClick,
}: VehicleListProps) {
  const [filter, setFilter] = useState<'ALL' | 'ON_TRIP' | 'ASSIGNED' | 'AVAILABLE'>('ALL');
  const [search, setSearch] = useState('');

  const onTripCount = vehicles.filter(
    (v) => v.tripStatus === 'IN_TRANSIT' || v.tripStatus === 'EN_ROUTE_PICKUP' || v.tripStatus === 'AT_PICKUP'
  ).length;
  const assignedCount = vehicles.filter((v) => v.tripStatus === 'ASSIGNED').length;
  const availableCount = vehicles.filter(
    (v) => v.tripStatus === 'AVAILABLE' || v.driverStatus === 'AVAILABLE'
  ).length;

  const filtered = vehicles.filter((v) => {
    // Status filter
    if (filter === 'ON_TRIP') {
      if (v.tripStatus !== 'IN_TRANSIT' && v.tripStatus !== 'EN_ROUTE_PICKUP' && v.tripStatus !== 'AT_PICKUP') {
        return false;
      }
    } else if (filter === 'ASSIGNED') {
      if (v.tripStatus !== 'ASSIGNED') return false;
    } else if (filter === 'AVAILABLE') {
      if (v.tripStatus !== 'AVAILABLE' && v.driverStatus !== 'AVAILABLE') return false;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPlate = v.vehiclePlate?.toLowerCase().includes(q);
      const matchDriver = v.driverName?.toLowerCase().includes(q);
      const matchCargo = v.cargoTitle?.toLowerCase().includes(q);
      const matchTrip = v.tripCode?.toLowerCase().includes(q);
      const matchCustomer = v.customerName?.toLowerCase().includes(q);
      if (!matchPlate && !matchDriver && !matchCargo && !matchTrip && !matchCustomer) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'IN_TRANSIT' || status === 'EN_ROUTE_PICKUP') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">In Transit</span>;
    }
    if (status === 'ASSIGNED') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800">Assigned</span>;
    }
    if (status === 'AVAILABLE') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Available</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plate, driver, cargo..."
          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex px-3 py-2 gap-1 border-b border-gray-100 bg-gray-50/50 text-xs overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'ALL' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          All ({vehicles.length})
        </button>
        <button
          onClick={() => setFilter('ON_TRIP')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'ON_TRIP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-emerald-700'
          }`}
        >
          Transit ({onTripCount})
        </button>
        <button
          onClick={() => setFilter('ASSIGNED')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'ASSIGNED' ? 'bg-sky-600 text-white shadow-sm' : 'text-gray-500 hover:text-sky-700'
          }`}
        >
          Assigned ({assignedCount})
        </button>
        <button
          onClick={() => setFilter('AVAILABLE')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'AVAILABLE' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-purple-700'
          }`}
        >
          Available ({availableCount})
        </button>
      </div>

      {/* Vehicle Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p className="text-xs">No matching vehicles found</p>
          </div>
        ) : (
          filtered.map((vehicle) => {
            const isSelected =
              vehicle.driverId === selectedDriverId ||
              (!!selectedTripId && vehicle.tripId === selectedTripId);

            return (
              <button
                key={vehicle.driverId}
                onClick={() => onVehicleClick(vehicle)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                {/* Header row: Plate & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {vehicle.vehiclePlate}
                    </span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[11px] text-gray-500 font-medium truncate max-w-[110px]">
                      {vehicle.vehicleCategory}
                    </span>
                  </div>
                  {getStatusBadge(vehicle.tripStatus)}
                </div>

                {/* Driver & App Status Row */}
                <div className="text-xs text-gray-600 mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-800">{vehicle.driverName}</span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="font-mono text-gray-400 text-[11px]">{vehicle.driverPhone}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    vehicle.appComplianceStatus === 'COMPLIANT'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {vehicle.appComplianceStatus === 'COMPLIANT' ? '📱 App OK' : '⚠️ No App'}
                  </span>
                </div>

                {/* Client & Trip Specs if active */}
                {vehicle.tripCode && vehicle.tripCode !== 'IDLE (Yard)' && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs space-y-1">
                    {vehicle.customerName && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[170px]">
                          🏢 {vehicle.customerName}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">{vehicle.tripCode}</span>
                      </div>
                    )}
                    {vehicle.cargoTitle && (
                      <p className="text-[11px] text-gray-700 font-medium truncate">
                        📦 {vehicle.cargoTitle}
                      </p>
                    )}
                    {(vehicle.originAddress || vehicle.destinationAddress) && (
                      <div className="text-[11px] text-gray-500 bg-gray-50 p-1 rounded space-y-0.5">
                        {vehicle.originAddress && (
                          <div className="truncate">🚩 {vehicle.originAddress}</div>
                        )}
                        {vehicle.destinationAddress && (
                          <div className="truncate text-emerald-700 font-medium">🏁 {vehicle.destinationAddress}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer specs: Speed, Battery, Ping */}
                <div className="text-[11px] text-gray-500 mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        vehicle.health === 'LIVE' ? 'bg-emerald-500' :
                        vehicle.health === 'DELAYED' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}
                    ></span>
                    {vehicle.speedKmh > 0 ? `${vehicle.speedKmh.toFixed(1)} km/h` : 'Parked'}
                  </span>
                  <span>⚡ {vehicle.batteryPercentage ?? 100}%</span>
                  <span className="text-gray-400">
                    {vehicle.lastPingAgeSeconds < 60
                      ? 'Live'
                      : vehicle.lastPingAgeSeconds < 3600
                      ? `${Math.floor(vehicle.lastPingAgeSeconds / 60)}m ago`
                      : 'Yard'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
