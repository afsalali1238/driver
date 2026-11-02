import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Driver {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  assignedVehiclePlate: string;
}

interface AuthState {
  token: string | null;
  driver: Driver | null;
  setToken: (token: string | null) => void;
  setDriver: (driver: Driver | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      driver: null,
      setToken: (token) => set({ token }),
      setDriver: (driver) => set({ driver }),
      logout: () => set({ token: null, driver: null }),
    }),
    {
      name: 'kasper-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);