'use client';

import { useEffect, useState } from 'react';
import { TripCard } from '@/components/TripCard';
import { useOpsStore } from '@/lib/store';
import { opsApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

const statusOptions = [
  'DRAFT', 'ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP',
  'IN_TRANSIT', 'AT_DESTINATION', 'COMPLETED', 'CANCELLED'
];

export default function TripsPage() {
  const { trips, setTrips, addTrip, selectedTripId, setSelectedTrip } = useOpsStore();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadTrips = async () => {
    try {
      const data = await opsApi.getTrips({ status: statusFilter || undefined });
      setTrips(data.trips);
      setLoading(false);
    } catch (e: unknown) {
      console.error('Failed to load trips:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [statusFilter]);

  const handleCreateTrip = async (data: any) => {
    try {
      const result = await opsApi.createTrip(data);
      addTrip({
        ...data,
        id: result.trip.id,
        tripCode: result.trip.tripCode,
        status: result.trip.status,
        trackingToken: result.trip.trackingToken,
        driverName: 'Unassigned',
        driverPhone: '-',
        vehiclePlate: '-',
        createdAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
    } catch (e: unknown) {
      alert('Failed to create trip: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Trip Dispatch Board</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-3 max-w-6xl mx-auto">
            {trips.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="mt-2">No trips found</p>
              </div>
            ) : (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => setSelectedTrip(trip.id)}
                  selected={trip.id === selectedTripId}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTrip} />
      )}
    </div>
  );
}

function CreateTripModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    cargoTitle: '',
    cargoWeightTons: '',
    cargoCategory: '',
    originAddress: '',
    originLat: '',
    originLon: '',
    destinationAddress: '',
    destinationLat: '',
    destinationLon: '',
    driverId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      ...formData,
      cargoWeightTons: parseFloat(formData.cargoWeightTons) || 0,
      originLat: parseFloat(formData.originLat),
      originLon: parseFloat(formData.originLon),
      destinationLat: parseFloat(formData.destinationLat),
      destinationLon: parseFloat(formData.destinationLon),
      driverId: formData.driverId || null,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create New Trip</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Title *</label>
              <input
                type="text"
                required
                value={formData.cargoTitle}
                onChange={(e) => setFormData({...formData, cargoTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (tons) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.cargoWeightTons}
                onChange={(e) => setFormData({...formData, cargoWeightTons: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.cargoCategory}
                onChange={(e) => setFormData({...formData, cargoCategory: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Unassigned</option>
              </select>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Origin (Pickup)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.originAddress}
                  onChange={(e) => setFormData({...formData, originAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.originLat}
                  onChange={(e) => setFormData({...formData, originLat: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lon *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.originLon}
                  onChange={(e) => setFormData({...formData, originLon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Destination (Drop-off)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lat *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.destinationLat}
                  onChange={(e) => setFormData({...formData, destinationLat: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lon *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.destinationLon}
                  onChange={(e) => setFormData({...formData, destinationLon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}