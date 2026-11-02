export const TRIP_STATUSES = [
  'ASSIGNED',
  'EN_ROUTE_PICKUP',
  'AT_PICKUP',
  'IN_TRANSIT',
  'AT_DESTINATION',
  'COMPLETED',
] as const;

export type TripStatus = typeof TRIP_STATUSES[number];

export const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  ASSIGNED: ['EN_ROUTE_PICKUP'],
  EN_ROUTE_PICKUP: ['AT_PICKUP'],
  AT_PICKUP: ['IN_TRANSIT'],
  IN_TRANSIT: ['AT_DESTINATION'],
  AT_DESTINATION: ['COMPLETED'],
  COMPLETED: [],
};

export const STATUS_LABELS: Record<TripStatus, string> = {
  ASSIGNED: 'Assigned',
  EN_ROUTE_PICKUP: 'En Route to Pickup',
  AT_PICKUP: 'At Pickup',
  IN_TRANSIT: 'In Transit',
  AT_DESTINATION: 'Arrived at Site',
  COMPLETED: 'Completed',
};

export const STATUS_COLORS: Record<TripStatus, string> = {
  ASSIGNED: '#3b82f6',
  EN_ROUTE_PICKUP: '#f59e0b',
  AT_PICKUP: '#f97316',
  IN_TRANSIT: '#22c55e',
  AT_DESTINATION: '#a855f7',
  COMPLETED: '#10b981',
};

export const SAMPLING_INTERVALS = {
  HIGH_SPEED: 10000,      // > 50 km/h
  CITY_DRIVING: 15000,    // 15-50 km/h
  SLOW: 20000,            // 2-15 km/h
  STATIONARY: 60000,      // < 2 km/h
  LOW_BATTERY: 45000,     // < 15% battery
};

export const GEOFENCE_RADIUS = 300; // meters
export const GPS_ACCURACY_THRESHOLD = 35; // meters
export const MAX_SPEED_KMH = 140; // impossible for heavy transport