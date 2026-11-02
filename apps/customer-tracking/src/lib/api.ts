const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchTracking(trackingToken: string) {
  const res = await fetch(`${API_BASE}/public/track/${trackingToken}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 10 }, // Revalidate every 10 seconds for near real-time
  });
  
  if (!res.ok) {
    if (res.status === 404) throw new Error('Tracking link not found or expired');
    if (res.status === 410) throw new Error('Tracking link has expired');
    throw new Error('Failed to load tracking data');
  }
  
  return res.json();
}

export interface TrackingData {
  trackingToken: string;
  tripCode: string;
  status: string;
  statusLabel: string;
  cargo: { title: string; category: string };
  origin: { address: string };
  destination: { address: string; latitude: number; longitude: number };
  livePosition: { latitude: number; longitude: number; speedKmh: number; bearing: number; updatedAt: string } | null;
  eta: { remainingDistanceKm: number; estimatedDurationMinutes: number; estimatedArrival: string } | null;
  supportContact: { phone: string; whatsapp: string };
}