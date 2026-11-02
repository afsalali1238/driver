import { getStoredToken } from './api';
import { useAuthStore } from '@/store/authStore';

export async function initializeAuth(setToken: (token: string | null) => void) {
  const token = await getStoredToken();
  if (token) setToken(token);
}