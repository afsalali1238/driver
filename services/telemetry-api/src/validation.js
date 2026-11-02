import { z } from 'zod';

// Driver auth
export const requestOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(30),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(30),
  otp: z.string().length(6),
  deviceInfo: z.object({
    platform: z.enum(['android', 'ios']),
    model: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }).optional(),
});

// Trip status update
export const updateTripStatusSchema = z.object({
  status: z.enum(['EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION', 'COMPLETED']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  remarks: z.string().optional(),
});

// Telemetry batch
export const telemetryBatchSchema = z.object({
  tripId: z.string().uuid(),
  batteryPercentage: z.number().int().min(0).max(100).optional(),
  isCharging: z.boolean().optional(),
  samples: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    speedKmh: z.number().optional(),
    bearing: z.number().optional(),
    accuracyMeters: z.number().optional(),
    altitudeMeters: z.number().optional(),
    recordedAt: z.number(),
  })).min(1).max(100),
});

// ePOD submission
export const epodSubmitSchema = z.object({
  receiverName: z.string().min(1).max(150),
  receiverPhone: z.string().min(10).max(30),
  receiverDesignation: z.string().max(100).optional(),
  signatureImageBase64: z.string().min(100), // base64 PNG
  inspectionPhotos: z.array(z.object({
    phase: z.enum(['PRE_TRIP', 'POST_TRIP']),
    url: z.string().url(),
    notes: z.string().optional(),
  })).optional(),
  remarks: z.string().optional(),
});

// Ops trip creation
export const createTripSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerPhone: z.string().max(30).optional(),
  cargoTitle: z.string().min(1).max(255),
  cargoWeightTons: z.number().positive().optional(),
  cargoCategory: z.string().max(100).optional(),
  cargoNotes: z.string().optional(),
  originAddress: z.string().min(1),
  originLat: z.number(),
  originLon: z.number(),
  originContactName: z.string().max(150).optional(),
  originContactPhone: z.string().max(30).optional(),
  destinationAddress: z.string().min(1),
  destinationLat: z.number(),
  destinationLon: z.number(),
  destinationContactName: z.string().max(150).optional(),
  destinationContactPhone: z.string().max(30).optional(),
  driverId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
});

// Query params
export const listTripsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
