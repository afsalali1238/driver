interface Trip {
  id: string;
  tripCode: string;
  status: string;
  cargoTitle: string;
  cargoWeightTons: string;
  cargoCategory: string;
  originAddress: string;
  originLat: number;
  originLon: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLon: number;
  customerName: string;
  customerPhone: string;
  trackingToken: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  scheduledAt: string | null;
  createdAt: string;
}

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
  selected: boolean;
}

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

export function TripCard({ trip, onClick, selected }: TripCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        selected
          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{trip.tripCode}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[trip.status] || 'bg-gray-100 text-gray-700'}`}>
              {trip.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">{trip.cargoTitle}</div>
          <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-4">
            <span>📦 {trip.cargoWeightTons}t • {trip.cargoCategory}</span>
            <span>👤 {trip.driverName} • {trip.vehiclePlate}</span>
            <span>🏢 {trip.customerName}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
            <span>📍 {trip.originAddress}</span>
            <span>→</span>
            <span>{trip.destinationAddress}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View Details
          </button>
          <span className="text-xs text-gray-400">Track: {trip.trackingToken.slice(0, 8)}...</span>
        </div>
      </div>
    </button>
  );
}