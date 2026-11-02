'use client';

import { useEffect, useState } from 'react';
import { FleetMap, Vehicle } from '@/components/FleetMap';
import { VehicleList } from '@/components/VehicleList';
import { TripDetailDrawer } from '@/components/TripDetailDrawer';
import { useOpsStore, FleetVehicle } from '@/lib/store';
import { useFleetWebSocket } from '@/hooks/useFleetWebSocket';
import { opsApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const {
    fleet,
    setFleet,
    updateVehicle,
    selectedTripId,
    setSelectedTrip,
    selectedDriverId,
    setSelectedDriver,
  } = useOpsStore();
  const [loading, setLoading] = useState(true);

  // Handle real-time events from WebSocket
  const handleEvent = (event: any) => {
    if (event.event === 'TRIP_LOCATION_UPDATE') {
      const existing = fleet.find((v) => v.driverId === event.data.driverId);
      const vehicle: FleetVehicle = {
        driverId: event.data.driverId,
        driverName: existing?.driverName || '',
        driverPhone: existing?.driverPhone || '',
        vehiclePlate: existing?.vehiclePlate || '',
        vehicleCategory: existing?.vehicleCategory,
        driverStatus: existing?.driverStatus,
        tripId: event.data.tripId,
        tripCode: existing?.tripCode || '',
        tripStatus: existing?.tripStatus || 'IN_TRANSIT',
        cargoTitle: existing?.cargoTitle,
        customerName: existing?.customerName,
        originAddress: existing?.originAddress,
        destinationAddress: existing?.destinationAddress,
        lat: event.data.lat,
        lon: event.data.lon,
        speedKmh: event.data.speedKmh,
        bearing: event.data.bearing,
        batteryPercentage: existing?.batteryPercentage || 100,
        lastPingAgeSeconds: 0,
        health: 'LIVE',
      };
      updateVehicle(vehicle);
    } else if (event.event === 'TRIP_STATUS_CHANGE') {
      loadFleet();
    }
  };

  useFleetWebSocket(handleEvent);

  const loadFleet = async () => {
    try {
      const data = await opsApi.getFleet();
      setFleet(data.fleet);
      setLoading(false);
    } catch (e: unknown) {
      console.error('Failed to load fleet:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedTrip(vehicle.tripId);
    setSelectedDriver(vehicle.driverId);
  };

  const inTransitCount = fleet.filter(
    (v) => v.tripStatus === 'IN_TRANSIT' || v.tripStatus === 'EN_ROUTE_PICKUP'
  ).length;
  const assignedCount = fleet.filter((v) => v.tripStatus === 'ASSIGNED').length;
  const availableCount = fleet.filter(
    (v) => v.tripStatus === 'AVAILABLE' || v.driverStatus === 'AVAILABLE'
  ).length;

  const selectedVehicle =
    fleet.find(
      (v) =>
        v.driverId === selectedDriverId ||
        (!!selectedTripId && v.tripId === selectedTripId)
    ) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Kasper Ops Dashboard</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
              Total Fleet: <strong className="text-gray-900">{fleet.length}</strong>
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              In Transit: <strong className="text-emerald-900">{inTransitCount}</strong>
            </span>
            <span className="text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              Assigned: <strong className="text-sky-900">{assignedCount}</strong>
            </span>
            <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
              In Yard: <strong className="text-purple-900">{availableCount}</strong>
            </span>
            <a
              href="/prototype"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md flex items-center gap-1.5 shadow-sm transition-colors text-xs"
            >
              ⚡ Founder Prototype Hub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map Panel */}
        <div className="flex-1 relative min-w-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <FleetMap
                vehicles={fleet}
                selectedTripId={selectedTripId}
                selectedDriverId={selectedDriverId}
                onVehicleClick={handleVehicleClick}
              />
              <TripDetailDrawer
                vehicle={selectedVehicle}
                onClose={() => {
                  setSelectedDriver(null);
                  setSelectedTrip(null);
                }}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 lg:w-96 border-l border-gray-200 bg-white flex flex-col shrink-0">
          <div className="p-3.5 border-b border-gray-200">
            <h2 className="font-bold text-sm text-gray-900">Fleet Operations Directory</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {fleet.length} vehicles mapped across UAE sites & yards
            </p>
          </div>
          <VehicleList
            vehicles={fleet}
            selectedTripId={selectedTripId}
            selectedDriverId={selectedDriverId}
            onVehicleClick={handleVehicleClick}
          />
        </div>
      </main>
    </div>
  );
}
