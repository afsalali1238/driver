import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { useTripStore } from '@/store/tripStore';
import { useOfflineStore } from '@/store/offlineStore';
import { db } from '@/lib/db';
import { SAMPLING_INTERVALS, GPS_ACCURACY_THRESHOLD, MAX_SPEED_KMH } from '@/constants';

const LOCATION_TASK_NAME = 'kasper-location-task';

interface LocationSample {
  latitude: number;
  longitude: number;
  speed: number;
  bearing: number;
  accuracy: number;
  altitude?: number;
  batteryLevel?: number;
  recordedAt: number;
}

function calculateSamplingInterval(speedKmh: number, batteryLevel: number): number {
  if (batteryLevel < 15) return SAMPLING_INTERVALS.LOW_BATTERY;
  if (speedKmh > 50) return SAMPLING_INTERVALS.HIGH_SPEED;
  if (speedKmh >= 15) return SAMPLING_INTERVALS.CITY_DRIVING;
  if (speedKmh > 2) return SAMPLING_INTERVALS.SLOW;
  return SAMPLING_INTERVALS.STATIONARY;
}

export function useLocationTracking() {
  const { activeTrip, updateTripStatus } = useTripStore();
  const { addToQueue } = useOfflineStore();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationSample | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSampleRef = useRef<LocationSample | null>(null);
  const batchBufferRef = useRef<LocationSample[]>([]);

  const startTracking = useCallback(async () => {
    if (!activeTrip) return;
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission required for trip tracking');
      return;
    }

    // Start background task
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 10000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Kasper Transport Active',
        notificationBody: `Trip ${activeTrip.tripCode} - Tracking location`,
        notificationColor: '#0ea5e9',
      },
    });

    setIsTracking(true);
    console.log('Location tracking started for trip:', activeTrip.id);
  }, [activeTrip]);

  const stopTracking = useCallback(async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {
      console.log('Location updates already stopped');
    }
    setIsTracking(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    console.log('Location tracking stopped');
  }, []);

  const processLocation = useCallback(async (location: Location.LocationObject) => {
    const trip = useTripStore.getState().activeTrip;
    if (!trip) return;

    const coords = location.coords;
    const speedKmh = (coords.speed ?? 0) * 3.6; // m/s to km/h
    const batteryLevel = await Battery.getBatteryLevelAsync() * 100;

    // Filter invalid readings
    if (coords.accuracy !== null && coords.accuracy > GPS_ACCURACY_THRESHOLD) return;
    if (speedKmh > MAX_SPEED_KMH) return;

    const sample: LocationSample = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: speedKmh,
      bearing: coords.heading ?? 0,
      accuracy: coords.accuracy ?? 0,
      altitude: coords.altitude ?? undefined,
      batteryLevel: Math.round(batteryLevel),
      recordedAt: Date.now(),
    };

    // Update current location for UI
    setCurrentLocation(sample);
    lastSampleRef.current = sample;

    // Add to batch buffer
    batchBufferRef.current.push(sample);

    // Store in SQLite immediately (offline-first)
    db.runSync(
      `INSERT INTO offline_breadcrumbs (trip_id, latitude, longitude, speed, bearing, accuracy, altitude, battery_level, recorded_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [trip.id, sample.latitude, sample.longitude, sample.speed, sample.bearing, sample.accuracy, sample.altitude ?? null, sample.batteryLevel ?? null, sample.recordedAt]
    );

    // Flush batch every 30 seconds
    if (batchBufferRef.current.length >= 10) {
      await flushBatch();
    }
  }, []);

  const flushBatch = useCallback(async () => {
    const trip = useTripStore.getState().activeTrip;
    const samples = [...batchBufferRef.current];
    if (samples.length === 0 || !trip) return;

    batchBufferRef.current = [];

    try {
      await fetch(`${__DEV__ ? 'http://10.0.2.2:4000' : 'https://api.kasper.ae'}/api/v1/driver/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          batteryPercentage: samples[samples.length - 1].batteryLevel,
          isCharging: false, // TODO: detect charging state
          samples: samples.map(s => ({
            latitude: s.latitude,
            longitude: s.longitude,
            speedKmh: s.speed,
            bearing: s.bearing,
            accuracyMeters: s.accuracy,
            altitudeMeters: s.altitude,
            recordedAt: s.recordedAt,
          })),
        }),
      });
      
      console.log('Batch synced:', samples.length, 'points');
    } catch (e) {
      console.log('Batch sync failed, will retry:', e);
      // Re-add to buffer for retry
      batchBufferRef.current.unshift(...samples);
    }
  }, []);

  // Sync loop - runs every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(flushBatch, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [flushBatch]);

  // Handle app foreground/background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && activeTrip && !isTracking) {
        startTracking();
      }
    });
    return () => subscription.remove();
  }, [activeTrip, isTracking, startTracking]);

  return {
    isTracking,
    currentLocation,
    startTracking,
    stopTracking,
  };
}
