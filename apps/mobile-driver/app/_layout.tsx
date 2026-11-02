import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { initializeAuth } from '@/lib/auth';

export default function RootLayout() {
  const { token, setToken } = useAuthStore();
  
  useEffect(() => {
    initializeAuth(setToken);
  }, [setToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}