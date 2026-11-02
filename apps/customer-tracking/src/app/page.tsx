import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kasper Transport Tracking</h1>
        <p className="text-gray-500 mb-6">Enter your tracking token to view live shipment status</p>
        
        <form action="/track/demo-token" className="space-y-4">
          <input
            type="text"
            name="trackingToken"
            placeholder="Enter tracking token (e.g., 8f92a1c0d4e7...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
            required
          />
          <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
            Track Shipment
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Demo token: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">8f92a1c0d4e740b2a3f912cd4e019a82</code>
        </p>
      </div>
    </div>
  );
}