'use client';

import { useEffect, useState } from 'react';
import { opsApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Driver {
  id: string;
  phone_number: string;
  full_name: string;
  license_number: string | null;
  assigned_vehicle_plate: string | null;
  vehicle_category: string | null;
  status: string;
  preferred_language: string;
  created_at: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    licenseNumber: '',
    assignedVehiclePlate: '',
    vehicleCategory: '',
    preferredLanguage: 'en',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadDrivers = async () => {
    try {
      const data = await opsApi.getDrivers();
      setDrivers(data.drivers);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load drivers:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await opsApi.createDriver(formData);
      loadDrivers();
      setShowCreateModal(false);
      setFormData({ phoneNumber: '', fullName: '', licenseNumber: '', assignedVehiclePlate: '', vehicleCategory: '', preferredLanguage: 'en' });
    } catch (e: any) {
      alert('Failed to create driver: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ON_TRIP: 'bg-blue-100 text-blue-700',
    OFF_DUTY: 'bg-gray-100 text-gray-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Driver Directory</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            Add Driver
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">No drivers found</td>
                    </tr>
                  ) : (
                    drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{driver.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{driver.phone_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{driver.license_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{driver.assigned_vehicle_plate || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{driver.vehicle_category || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[driver.status] || 'bg-gray-100 text-gray-700'}`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{driver.preferred_language.toUpperCase()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Driver</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate</label>
                <input
                  type="text"
                  value={formData.assignedVehiclePlate}
                  onChange={(e) => setFormData({...formData, assignedVehiclePlate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Category</label>
                <input
                  type="text"
                  value={formData.vehicleCategory}
                  onChange={(e) => setFormData({...formData, vehicleCategory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}