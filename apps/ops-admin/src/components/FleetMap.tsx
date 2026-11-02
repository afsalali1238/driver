'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(
  () => import('./FleetMapClient').then(mod => mod.FleetMapClient),
  { ssr: false }
);

export interface Vehicle {
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleCategory?: string;
  driverStatus?: string;
  tripId: string;
  tripCode: string;
  tripStatus: string;
  cargoTitle?: string;
  customerName?: string;
  customerPhone?: string;
  trackingToken?: string;
  originAddress?: string;
  originLat?: number | null;
  originLon?: number | null;
  destinationAddress?: string;
  destinationLat?: number | null;
  destinationLon?: number | null;
  lat: number;
  lon: number;
  speedKmh: number;
  bearing: number;
  batteryPercentage: number;
  lastPingAgeSeconds: number;
  health: 'LIVE' | 'DELAYED' | 'OFFLINE';
  appComplianceStatus?: 'COMPLIANT' | 'PENDING_INSTALL' | 'NON_COMPLIANT';
  appVersion?: string;
  deviceModel?: string;
}

interface FleetMapProps {
  vehicles: Vehicle[];
  selectedTripId?: string | null;
  selectedDriverId?: string | null;
  onVehicleClick: (vehicle: Vehicle) => void;
  center?: [number, number];
  zoom?: number;
}

export function FleetMap({
  vehicles,
  selectedTripId,
  selectedDriverId,
  onVehicleClick,
  center = [25.0, 55.2],
  zoom = 9,
}: FleetMapProps) {
  return (
    <LeafletMap
      vehicles={vehicles}
      selectedTripId={selectedTripId}
      selectedDriverId={selectedDriverId}
      onVehicleClick={onVehicleClick}
      center={center}
      zoom={zoom}
    />
  );
}
