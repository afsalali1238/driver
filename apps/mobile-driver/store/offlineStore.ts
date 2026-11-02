import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedItem {
  id: string;
  type: 'telemetry' | 'status' | 'epod' | 'inspection';
  payload: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  queue: QueuedItem[];
  addToQueue: (item: Omit<QueuedItem, 'id' | 'timestamp' | 'retries'>) => void;
  removeFromQueue: (id: string) => void;
  incrementRetries: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (item) => set((state) => ({
        queue: [...state.queue, { ...item, id: crypto.randomUUID(), timestamp: Date.now(), retries: 0 }],
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((item) => item.id !== id),
      })),
      incrementRetries: (id) => set((state) => ({
        queue: state.queue.map((item) => item.id === id ? { ...item, retries: item.retries + 1 } : item),
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'kasper-offline',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);