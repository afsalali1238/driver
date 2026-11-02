'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchTracking, TrackingData } from '@/lib/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

const TrackingMap = dynamic(
  () => import('@/components/TrackingMap').then((mod) => mod.TrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
          <span>Loading map telemetry...</span>
        </div>
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ trackingToken: string }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Not Started',
  ASSIGNED: 'Assigned to Driver',
  EN_ROUTE_PICKUP: 'En Route to Pickup',
  AT_PICKUP: 'At Pickup Location',
  IN_TRANSIT: 'In Transit to Site',
  AT_DESTINATION: 'Arrived at Site',
  COMPLETED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  EN_ROUTE_PICKUP: 'bg-yellow-100 text-yellow-700',
  AT_PICKUP: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-green-100 text-green-700',
  AT_DESTINATION: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusSteps = [
  { key: 'DRAFT', label: 'Dispatched' },
  { key: 'EN_ROUTE_PICKUP', label: 'En Route to Pickup' },
  { key: 'AT_PICKUP', label: 'At Pickup' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'AT_DESTINATION', label: 'Arrived at Site' },
  { key: 'COMPLETED', label: 'Delivered' },
];

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function TrackingPage({ params }: PageProps) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      const token = (await params).trackingToken;
      setTrackingToken(token);
      try {
        const result = await fetchTracking(token);
        if (mounted) setData(result);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    
    // Poll for updates every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Tracking</h1>
          <p className="text-gray-500 mb-6">{error || 'Tracking link not found or expired'}</p>
          <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(data.status);
  const etaMinutes = data.eta?.estimatedDurationMinutes;
  const arrivalTime = data.eta?.estimatedArrival ? parseISO(data.eta.estimatedArrival) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Kasper Transport</h1>
                <p className="text-xs text-gray-500 font-medium">Live Heavy Freight Tracking</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[data.status] || 'bg-gray-100 text-gray-700'}`}>
              {statusLabels[data.status] || data.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Trip Code & Cargo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shipment Reference</p>
              <p className="text-xl font-bold text-gray-900 font-mono mt-0.5">{data.tripCode}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cargo</p>
              <p className="font-bold text-gray-900 mt-0.5">{data.cargo.title}</p>
              <p className="text-xs text-gray-500">{data.cargo.category}</p>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipment Progress</p>
          </div>
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-1 bg-gray-100" />
            <div className="absolute left-0 right-0 top-5 h-1 bg-primary-600 transition-all duration-500" style={{ width: `${Math.min((currentStep / (statusSteps.length - 1)) * 100, 100)}%` }} />
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                    index <= currentStep ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {index < currentStep ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : index === currentStep && data.status !== 'COMPLETED' ? (
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <p className={`mt-2 text-xs text-center font-medium ${index <= currentStep ? 'text-primary-700 font-semibold' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS Telemetry
            </p>
            <span className="text-xs text-gray-400">Updates every 15s</span>
          </div>
          <div style={{ height: '360px', width: '100%' }}>
            <TrackingMap
              livePosition={data.livePosition}
              destination={data.destination}
              trail={[]}
            />
          </div>
          
          {/* Live Info Bar */}
          {data.livePosition && (
            <div className="bg-gray-50 border-t border-gray-100 p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-mono font-bold text-gray-900">{data.livePosition.speedKmh?.toFixed(1) ?? '0.0'}</p>
                <p className="text-xs font-medium text-gray-500 uppercase mt-0.5">Speed (km/h)</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-gray-900">
                  {data.eta?.remainingDistanceKm?.toFixed(1) ?? '-'}
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase mt-0.5">KM Remaining</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-primary-600">
                  {etaMinutes ? `${etaMinutes} min` : '-'}
                </p>
                <p className="text-xs font-medium text-gray-500 uppercase mt-0.5">Dynamic ETA</p>
              </div>
            </div>
          )}
        </div>

        {/* Route Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Route Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-primary-600 uppercase mb-1">Pickup Origin</p>
              <p className="font-semibold text-gray-900 text-sm">{data.origin.address}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Destination Site</p>
              <p className="font-semibold text-gray-900 text-sm">{data.destination.address}</p>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Site Logistics Support</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`tel:${data.supportContact.phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 2.257a1 1 0 00-.624 1.41L9 19.5a1 1 0 001.41.62l2.257-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 00.684-.948V7a2 2 0 00-2-2h-3.28a1 1 0 01-.948-.684l-1.498-4.493a1 1 0 00-.502-1.21l2.257-2.257a1 1 0 01.624-1.41L15 4.5a1 1 0 01-1.41-.62l-2.257 2.257a1 1 0 00-1.21.502l-4.493-1.498A1 1 0 013 5v12a2 2 0 002 2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 2.257a1 1 0 00-.624 1.41L15 19.5a1 1 0 01-1.41.62l-2.257-2.257a1 1 0 01-1.21-.502l-4.493-1.498A1 1 0 013 17V5z" />
              </svg>
              Call Dispatch Hub
            </a>
            <a href={`https://wa.me/${data.supportContact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm shadow-sm transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.369-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              WhatsApp Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6">
          <p>Tracking Link Reference: <code className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{trackingToken}</code></p>
          <p className="mt-1">Kasper Logistics Platform • Privacy Shield Active (Driver personal contacts hidden)</p>
        </div>
      </main>
    </div>
  );
}
