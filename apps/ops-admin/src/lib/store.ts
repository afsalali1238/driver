import { create } from 'zustand';

interface FleetVehicle {
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

interface Trip {
  id: string;
  tripCode: string;
  status: string;
  cargoTitle: string;
  cargoWeightTons: string;
  cargoCategory: string;
  originAddress: string;
  originLat: number;
  originLon: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLon: number;
  customerName: string;
  customerPhone: string;
  trackingToken: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  scheduledAt: string | null;
  createdAt: string;
}

interface OpsState {
  fleet: FleetVehicle[];
  trips: Trip[];
  selectedTripId: string | null;
  selectedDriverId: string | null;
  setFleet: (fleet: FleetVehicle[]) => void;
  updateVehicle: (vehicle: FleetVehicle) => void;
  setTrips: (trips: Trip[]) => void;
  setSelectedTrip: (tripId: string | null) => void;
  setSelectedDriver: (driverId: string | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
}

const useOpsStore = create<OpsState>()(
  (set) => ({
    fleet: [],
    trips: [],
    selectedTripId: null,
    selectedDriverId: null,
    setFleet: (fleet) => set({ fleet }),
    updateVehicle: (vehicle) => set((state) => ({
      fleet: state.fleet.map((v) => (v.driverId === vehicle.driverId ? vehicle : v)),
    })),
    setTrips: (trips) => set({ trips }),
    setSelectedTrip: (selectedTripId) => set({ selectedTripId }),
    setSelectedDriver: (selectedDriverId) => set({ selectedDriverId }),
    addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
    updateTrip: (trip) => set((state) => ({
      trips: state.trips.map((t) => (t.id === trip.id ? trip : t)),
    })),
  })
);

export { useOpsStore, type FleetVehicle, type Trip };
