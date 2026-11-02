const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('ops_token'); } catch { return null; }
}

async function getOrEnsureToken(): Promise<string | null> {
  let token = getToken();
  if (token) return token;

  // Auto-authenticate with demo credentials so dashboard loads immediately
  try {
    const res = await fetch(`${API_BASE}/ops/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kasper.ae', password: 'Admin@Kasper2026' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('ops_token', data.token);
        localStorage.setItem('ops_user', JSON.stringify(data.user));
        return data.token;
      }
    }
  } catch (e) {
    console.warn('Auto-login attempt failed:', e);
  }
  return null;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = await getOrEnsureToken();
  
  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // If 401 Unauthorized, refresh demo token and retry once
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('ops_token');
    token = await getOrEnsureToken();
    if (token) {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    }
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export const opsApi = {
  login: (email: string, password: string) => 
    fetchApi('/ops/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  getFleet: () => fetchApi('/ops/fleet/live-positions'),
  
  getTrips: (params?: { status?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    return fetchApi(`/ops/trips?${search.toString()}`);
  },
  
  createTrip: (data: any) => fetchApi('/ops/trips', { method: 'POST', body: JSON.stringify(data) }),
  
  getRouteTrail: (tripId: string) => fetchApi(`/ops/trips/${tripId}/route-trail`),
  
  getDrivers: () => fetchApi('/ops/drivers'),
  
  createDriver: (data: any) => fetchApi('/ops/drivers', { method: 'POST', body: JSON.stringify(data) }),
};
