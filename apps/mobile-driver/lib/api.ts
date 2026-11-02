import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = __DEV__ ? 'http://10.0.2.2:4000/api/v1' : 'https://api.kasper.ae/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Token management
export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem('ops_token');
  }
  return SecureStore.getItemAsync('kasper_driver_token');
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (token) localStorage.setItem('ops_token', token);
    else localStorage.removeItem('ops_token');
  } else {
    if (token) await SecureStore.setItemAsync('kasper_driver_token', token);
    else await SecureStore.deleteItemAsync('kasper_driver_token');
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const driverApi = {
  requestOtp: (phoneNumber: string) => api.post('/driver/auth/request-otp', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otp: string, deviceInfo?: any) => 
    api.post('/driver/auth/verify-otp', { phoneNumber, otp, deviceInfo }),
  getActiveTrip: () => api.get('/driver/trips/active'),
  updateTripStatus: (tripId: string, status: string, latitude?: number, longitude?: number, remarks?: string) =>
    api.post(`/driver/trips/${tripId}/status`, { status, latitude, longitude, remarks }),
  sendTelemetryBatch: (tripId: string, batteryPercentage: number, isCharging: boolean, samples: any[]) =>
    api.post('/driver/telemetry/batch', { tripId, batteryPercentage, isCharging, samples }),
  submitEpod: (tripId: string, data: any) => api.post(`/driver/trips/${tripId}/epod`, data),
};

export default api;