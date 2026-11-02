'use client';

import { useEffect, useState } from 'react';
import { opsApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface EpodRecord {
  id: string;
  trip_id: string;
  trip_code: string;
  driver_name: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_designation: string | null;
  signature_image_url: string;
  signoff_latitude: number | null;
  signoff_longitude: number | null;
  remarks: string | null;
  generated_pdf_url: string | null;
  signed_at: string;
}

export default function EpodVaultPage() {
  const [epods, setEpds] = useState<EpodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEpds = async () => {
    try {
      // This would need a new API endpoint, for now we'll show placeholder
      setLoading(false);
    } catch (e) {
      console.error('Failed to load ePODs:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpds();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-full mx-auto">
          <h1 className="text-xl font-bold text-gray-900">ePOD Vault</h1>
          <p className="text-sm text-gray-500 mt-1">Electronic Proof of Delivery Records</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">ePOD Archive</h2>
            <p className="mt-2 text-gray-500">Digital signatures and delivery confirmations will appear here.</p>
            <p className="mt-1 text-sm text-gray-400">Requires /api/v1/ops/epod endpoint implementation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}