import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useTripStore } from '@/store/tripStore';
import { TabIcon } from '@/components/TabIcon';

export default function TabsLayout() {
  const { activeTrip } = useTripStore();
  const { startTracking, stopTracking } = useLocationTracking();

  useEffect(() => {
    if (activeTrip && activeTrip.status !== 'COMPLETED' && activeTrip.status !== 'ASSIGNED') {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [activeTrip?.status, startTracking, stopTracking]);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0ea5e9', tabBarInactiveTintColor: '#94a3b8' }}>
      <Tabs.Screen name="trip" options={{ title: 'Trip', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="truck" focused={focused} /> }} />
      <Tabs.Screen name="inspection" options={{ title: 'Inspect', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="camera" focused={focused} /> }} />
      <Tabs.Screen name="epod" options={{ title: 'ePOD', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="signature" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="user" focused={focused} /> }} />
    </Tabs>
  );
}
