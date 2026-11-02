import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Cargo {
  title: string;
  weightTons: number;
  category: string;
  notes?: string;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
  contactName?: string;
  contactPhone?: string;
}

interface Trip {
  id: string;
  tripCode: string;
  status: string;
  cargo: Cargo;
  origin: Location;
  destination: Location;
  customer: { companyName: string };
  scheduledPickupTime?: string;
}

interface TripState {
  activeTrip: Trip | null;
  setActiveTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      activeTrip: null,
      setActiveTrip: (activeTrip) => set({ activeTrip }),
      updateTripStatus: (status) => set((state) => ({
        activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null,
      })),
    }),
    {
      name: 'kasper-trip',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);