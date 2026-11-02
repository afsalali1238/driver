'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Vehicle } from './FleetMap';

interface FleetMapClientProps {
  vehicles: Vehicle[];
  selectedTripId?: string | null;
  selectedDriverId?: string | null;
  onVehicleClick: (vehicle: Vehicle) => void;
  center?: [number, number];
  zoom?: number;
}

// Controller component inside MapContainer to handle fitBounds and flyTo
function MapController({
  vehicles,
  selectedDriverId,
}: {
  vehicles: Vehicle[];
  selectedDriverId?: string | null;
}) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  // Auto-fit bounds on initial vehicles load
  useEffect(() => {
    const valid = vehicles.filter((v) => v.lat && v.lon && !isNaN(v.lat) && !isNaN(v.lon));
    if (valid.length > 0 && !hasFittedRef.current) {
      const bounds = L.latLngBounds(valid.map((v) => [v.lat, v.lon] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
      hasFittedRef.current = true;
    }
  }, [vehicles, map]);

  // Fly to selected vehicle when selection changes
  useEffect(() => {
    if (!selectedDriverId) return;
    const selected = vehicles.find((v) => v.driverId === selectedDriverId);
    if (selected && selected.lat && selected.lon) {
      map.flyTo([selected.lat, selected.lon], 14, { duration: 1.0 });
    }
  }, [selectedDriverId, vehicles, map]);

  return null;
}

// Generate high-visibility origin pickup icon
function createOriginIcon(address?: string) {
  return L.divIcon({
    className: 'custom-origin-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; pointer-events:auto;">
        <div style="background:#0284c7; color:white; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px;">
          🚩 PICKUP YARD
        </div>
        <div style="width:26px; height:26px; border-radius:50%; background:#0284c7; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold;">
          ⌂
        </div>
      </div>
    `,
    iconSize: [70, 44],
    iconAnchor: [35, 40],
  });
}

// Generate high-visibility destination client site icon
function createDestinationIcon(client?: string) {
  return L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; pointer-events:auto;">
        <div style="background:#dc2626; color:white; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; max-width:140px; overflow:hidden; text-overflow:ellipsis;">
          🏁 ${client || 'CLIENT SITE'}
        </div>
        <div style="width:26px; height:26px; border-radius:50%; background:#dc2626; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold;">
          ▼
        </div>
      </div>
    `,
    iconSize: [100, 44],
    iconAnchor: [50, 40],
  });
}

// Generate high-visibility custom truck icon with plate tag and direction
function createTruckIcon(vehicle: Vehicle, isSelected: boolean) {
  const isAvailable = vehicle.tripStatus === 'AVAILABLE' || vehicle.driverStatus === 'AVAILABLE';
  const isAssigned = vehicle.tripStatus === 'ASSIGNED';
  const isInTransit = vehicle.tripStatus === 'IN_TRANSIT' || vehicle.tripStatus === 'EN_ROUTE_PICKUP';

  let color = '#64748b'; // default slate (offline/idle)
  let statusBadge = 'IDLE';

  if (isInTransit) {
    color = vehicle.health === 'LIVE' ? '#10b981' : vehicle.health === 'DELAYED' ? '#f59e0b' : '#3b82f6';
    statusBadge = vehicle.speedKmh > 0 ? `${vehicle.speedKmh.toFixed(0)} km/h` : 'TRANSIT';
  } else if (isAssigned) {
    color = '#0284c7';
    statusBadge = 'ASSIGNED';
  } else if (isAvailable) {
    color = '#8b5cf6';
    statusBadge = 'AVAILABLE';
  }

  const borderClass = isSelected ? 'ring-4 ring-primary-500 scale-110 shadow-xl' : 'shadow-md';

  return L.divIcon({
    className: 'custom-fleet-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background: white;
          color: #0f172a;
          font-weight: 800;
          font-family: monospace;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 6px;
          border: 1.5px solid ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          white-space: nowrap;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};"></span>
          ${vehicle.vehiclePlate}
        </div>
        <div style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          transform: rotate(${vehicle.bearing || 0}deg);
        " class="${borderClass}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 48],
    popupAnchor: [0, -48],
  });
}

function VehicleMarker({
  vehicle,
  isSelected,
  onClick,
}: {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!vehicle.lat || !vehicle.lon || isNaN(vehicle.lat) || isNaN(vehicle.lon)) {
    return null;
  }

  const icon = createTruckIcon(vehicle, isSelected);

  const getStatusColor = () => {
    if (vehicle.tripStatus === 'IN_TRANSIT') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (vehicle.tripStatus === 'ASSIGNED') return 'bg-sky-100 text-sky-800 border-sky-300';
    if (vehicle.tripStatus === 'AVAILABLE') return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Marker
      position={[vehicle.lat, vehicle.lon]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="p-3 min-w-[240px] max-w-[280px] font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <div>
              <div className="font-mono font-extrabold text-base text-gray-900">
                {vehicle.vehiclePlate}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {vehicle.vehicleCategory || 'Heavy Equipment'}
              </div>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor()}`}>
              {vehicle.tripStatus}
            </span>
          </div>

          {/* Driver Info */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Driver:</span>
              <span className="font-semibold text-gray-800">{vehicle.driverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <a href={`tel:${vehicle.driverPhone}`} className="text-primary-600 hover:underline font-mono">
                {vehicle.driverPhone}
              </a>
            </div>

            {/* Trip & Client Specs */}
            {vehicle.tripCode && vehicle.tripCode !== 'IDLE (Yard)' && (
              <>
                <div className="border-t pt-1.5 mt-1.5 space-y-1">
                  {vehicle.customerName && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Client:</span>
                      <span className="font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[150px]">
                        {vehicle.customerName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trip Code:</span>
                    <span className="font-mono font-bold text-gray-900">{vehicle.tripCode}</span>
                  </div>
                  {vehicle.cargoTitle && (
                    <div className="flex justify-between mt-0.5">
                      <span className="text-gray-500">Cargo:</span>
                      <span className="font-medium text-gray-800 truncate max-w-[150px]">{vehicle.cargoTitle}</span>
                    </div>
                  )}
                  {vehicle.originAddress && (
                    <div className="flex justify-between mt-0.5 text-[11px]">
                      <span className="text-gray-500">Pickup:</span>
                      <span className="font-medium text-gray-700 truncate max-w-[150px]">{vehicle.originAddress}</span>
                    </div>
                  )}
                  {vehicle.destinationAddress && (
                    <div className="flex justify-between mt-0.5 text-[11px]">
                      <span className="text-gray-500">Drop-off:</span>
                      <span className="font-medium text-emerald-700 truncate max-w-[150px]">{vehicle.destinationAddress}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mandatory Driver App Status */}
            <div className="border-t pt-1.5 mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Driver App:</span>
              <span className={`font-medium px-1.5 py-0.5 rounded text-[10px] ${
                vehicle.appComplianceStatus === 'COMPLIANT'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {vehicle.appComplianceStatus === 'COMPLIANT' ? '✓ Mobile App Active' : '⚠️ Install Pending'}
              </span>
            </div>

            {/* Telemetry Footer */}
            <div className="border-t pt-2 mt-2 grid grid-cols-2 gap-2 text-center bg-gray-50 p-1.5 rounded">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Speed</p>
                <p className="font-bold text-gray-800">{vehicle.speedKmh?.toFixed(1) ?? '0.0'} km/h</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Battery</p>
                <p className="font-bold text-gray-800">{vehicle.batteryPercentage ?? 100}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  vehicle.health === 'LIVE' ? 'bg-green-500' :
                  vehicle.health === 'DELAYED' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></span>
                {vehicle.health}
              </span>
              <span>
                {vehicle.lastPingAgeSeconds < 60
                  ? 'Active now'
                  : vehicle.lastPingAgeSeconds < 3600
                  ? `${Math.floor(vehicle.lastPingAgeSeconds / 60)}m ago`
                  : 'Parked in Yard'}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function FleetMapClient({
  vehicles,
  selectedTripId,
  selectedDriverId,
  onVehicleClick,
  center = [25.0, 55.2],
  zoom = 9,
}: FleetMapClientProps) {
  const selectedVehicle = vehicles.find(
    (v) =>
      v.driverId === selectedDriverId ||
      (!!selectedTripId && v.tripId === selectedTripId)
  );

  const hasRouteCoords =
    selectedVehicle &&
    selectedVehicle.originLat != null &&
    selectedVehicle.originLon != null &&
    selectedVehicle.destinationLat != null &&
    selectedVehicle.destinationLon != null;

  const routePositions: [number, number][] = hasRouteCoords
    ? [
        [selectedVehicle.originLat!, selectedVehicle.originLon!],
        [selectedVehicle.lat, selectedVehicle.lon],
        [selectedVehicle.destinationLat!, selectedVehicle.destinationLon!],
      ]
    : [];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapController vehicles={vehicles} selectedDriverId={selectedDriverId} />

      {/* Route polyline and endpoints for selected vehicle */}
      {hasRouteCoords && (
        <>
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#0284c7',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />
          <Marker
            position={[selectedVehicle.originLat!, selectedVehicle.originLon!]}
            icon={createOriginIcon(selectedVehicle.originAddress)}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-sky-800">🚩 Pickup Location</div>
                <div className="text-gray-700 mt-1">{selectedVehicle.originAddress || 'Origin Depot'}</div>
                <div className="text-gray-500 font-mono text-[10px] mt-0.5">
                  GPS: {selectedVehicle.originLat?.toFixed(4)}, {selectedVehicle.originLon?.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
          <Marker
            position={[selectedVehicle.destinationLat!, selectedVehicle.destinationLon!]}
            icon={createDestinationIcon(selectedVehicle.customerName)}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-red-800">🏁 Client Drop-off Site</div>
                <div className="font-semibold text-gray-900 mt-0.5">{selectedVehicle.customerName}</div>
                <div className="text-gray-700 mt-1">{selectedVehicle.destinationAddress || 'Project Site'}</div>
                <div className="text-gray-500 font-mono text-[10px] mt-0.5">
                  GPS: {selectedVehicle.destinationLat?.toFixed(4)}, {selectedVehicle.destinationLon?.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {vehicles.map((vehicle) => (
        <VehicleMarker
          key={vehicle.driverId}
          vehicle={vehicle}
          isSelected={
            vehicle.driverId === selectedDriverId ||
            (!!selectedTripId && vehicle.tripId === selectedTripId)
          }
          onClick={() => onVehicleClick(vehicle)}
        />
      ))}
    </MapContainer>
  );
}
