export interface TripData {
  id: string;
  trackingToken: string;
  vehiclePlate: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  cargoDescription: string;
  cargoWeightTon: number;
  cargoDimensions: string;
  transportPermit: string;
  originName: string;
  originCoords: [number, number]; // [lat, lng]
  destinationName: string;
  destinationCoords: [number, number];
  currentCoords: [number, number];
  speedKmh: number;
  headingDeg: number;
  batteryPct: number;
  status: 'IN_TRANSIT' | 'ASSIGNED' | 'ARRIVED_PICKUP' | 'ARRIVED_DESTINATION' | 'DELIVERED' | 'AVAILABLE';
  etaMinutes: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  startedAt: string;
  estimatedArrival: string;
  routeTrail: [number, number][];
  epod?: {
    receiverName: string;
    receiverPhone: string;
    receiverRole: string;
    signedAt: string;
    signatureUrl: string;
    deliveryNotes: string;
    consignmentNumber: string;
  };
}

export const DUMMY_TRIPS: TripData[] = [
  {
    id: 'KSP-TR-2041',
    trackingToken: '8f92a1c0d4e740b2a3f912cd4e019a82',
    vehiclePlate: 'DXB-T-49102',
    vehicleType: 'Heavy Flatbed 40ft (Triple-Axle)',
    driverName: 'Rashid Khan',
    driverPhone: '+971 50 111 2233',
    cargoDescription: 'CAT 320D Hydraulic Excavator (Boom & Bucket Secured)',
    cargoWeightTon: 22.4,
    cargoDimensions: '9.5m x 3.0m x 3.1m',
    transportPermit: 'RTA-OVERSIZE-2026-9941',
    originName: 'Dubai South Logistics City, Gate 7',
    originCoords: [24.8934, 55.1582],
    destinationName: 'Abu Dhabi Saadiyat Cultural District (Louvre Phase 2)',
    destinationCoords: [24.5332, 54.4021],
    currentCoords: [24.7128, 54.7891],
    speedKmh: 68,
    headingDeg: 235,
    batteryPct: 88,
    status: 'IN_TRANSIT',
    etaMinutes: 42,
    distanceRemainingKm: 51.4,
    totalDistanceKm: 114.2,
    startedAt: '07:30 AM Today',
    estimatedArrival: '11:15 AM Today',
    routeTrail: [
      [24.8934, 55.1582],
      [24.8512, 55.0841],
      [24.7950, 54.9620],
      [24.7410, 54.8510],
      [24.7128, 54.7891],
    ],
    epod: {
      receiverName: 'Eng. Mustafa Al-Hashimi',
      receiverPhone: '+971 52 984 5512',
      receiverRole: 'Senior Site Logistics Engineer, Arabtec EPC',
      signedAt: 'Pending Delivery',
      signatureUrl: '',
      deliveryNotes: 'Pre-inspected. 4x Heavy Grade Ratchet Binder chains inspected and verified at yard.',
      consignmentNumber: 'KSP-POD-DXB-94821',
    }
  },
  {
    id: 'KSP-TR-2042',
    trackingToken: '7a81b2c3d4e5f601a2b3c4d5e6f7a8b9',
    vehiclePlate: 'AUH-T-12891',
    vehicleType: 'Lowbed 60-Ton (Hydraulic Gooseneck)',
    driverName: 'Tariq Mehmood',
    driverPhone: '+971 50 445 7890',
    cargoDescription: 'Cummins 500kVA Soundproof Generator + Fuel Cell Auxiliary',
    cargoWeightTon: 14.8,
    cargoDimensions: '5.8m x 2.2m x 2.6m',
    transportPermit: 'ADNOC-CRITICAL-PERMIT-4012',
    originName: 'Jebel Ali Freezone (JAFZA South), Yard 4B',
    originCoords: [24.9857, 55.0743],
    destinationName: 'Ruwais Refinery Expansion Sector 4, Abu Dhabi',
    destinationCoords: [24.1102, 52.7305],
    currentCoords: [24.4610, 54.3412],
    speedKmh: 72,
    headingDeg: 245,
    batteryPct: 94,
    status: 'IN_TRANSIT',
    etaMinutes: 135,
    distanceRemainingKm: 168.0,
    totalDistanceKm: 275.5,
    startedAt: '06:00 AM Today',
    estimatedArrival: '01:45 PM Today',
    routeTrail: [
      [24.9857, 55.0743],
      [24.8912, 54.9123],
      [24.7100, 54.6540],
      [24.4610, 54.3412],
    ],
    epod: {
      receiverName: 'Sultan Al-Mazrouei',
      receiverPhone: '+971 50 882 1993',
      receiverRole: 'ADNOC Plant Inward Materials Controller',
      signedAt: 'Pending Delivery',
      signatureUrl: '',
      deliveryNotes: 'Security clearance pass approved. Delivery to gate 12 with escort.',
      consignmentNumber: 'KSP-POD-AUH-11029',
    }
  },
  {
    id: 'KSP-TR-2043',
    trackingToken: '6b72a1c0d4e740b2a3f912cd4e019a77',
    vehiclePlate: 'SHJ-T-55194',
    vehicleType: 'Multi-Axle Semi-Trailer (Extendable 18m)',
    driverName: 'Sajid Ali',
    driverPhone: '+971 55 992 3411',
    cargoDescription: 'Precast High-Strength Concrete Bridge Beams (x2)',
    cargoWeightTon: 36.5,
    cargoDimensions: '17.2m x 1.8m x 1.9m',
    transportPermit: 'SHJ-POLICE-ESCORT-REQ-551',
    originName: 'Hamriyah Free Zone Precast Plant, Sharjah',
    originCoords: [25.4651, 55.4981],
    destinationName: 'Dubai Silicon Oasis Commercial Hub, Tower B',
    destinationCoords: [25.1221, 55.3789],
    currentCoords: [25.4651, 55.4981],
    speedKmh: 0,
    headingDeg: 180,
    batteryPct: 76,
    status: 'ASSIGNED',
    etaMinutes: 65,
    distanceRemainingKm: 48.0,
    totalDistanceKm: 48.0,
    startedAt: 'Standby / Loading',
    estimatedArrival: '12:30 PM Today',
    routeTrail: [
      [25.4651, 55.4981]
    ],
    epod: {
      receiverName: 'Kareem Mansoor',
      receiverPhone: '+971 56 312 8744',
      receiverRole: 'Site Construction Manager',
      signedAt: 'Pending Loading Inspection',
      signatureUrl: '',
      deliveryNotes: 'Requires 100-ton crane on-site for immediate offloading.',
      consignmentNumber: 'KSP-POD-SHJ-33918',
    }
  },
  {
    id: 'KSP-TR-2040',
    trackingToken: '5c63a1c0d4e740b2a3f912cd4e019a66',
    vehiclePlate: 'AUH-T-33901',
    vehicleType: 'Telescopic Boom Truck 28-Ton',
    driverName: 'Farooq Ahmed',
    driverPhone: '+971 50 678 1234',
    cargoDescription: 'JLG 800AJ 80ft Articulating Diesel Boom Lift',
    cargoWeightTon: 15.6,
    cargoDimensions: '11.1m x 2.5m x 3.0m',
    transportPermit: 'AD-MUNICIPALITY-2026-102',
    originName: 'Mussafah Industrial Area M-38, Abu Dhabi',
    originCoords: [24.3412, 54.5123],
    destinationName: 'Yas Island South Theme Park Zone',
    destinationCoords: [24.4821, 54.6041],
    currentCoords: [24.4821, 54.6041],
    speedKmh: 0,
    headingDeg: 45,
    batteryPct: 92,
    status: 'DELIVERED',
    etaMinutes: 0,
    distanceRemainingKm: 0,
    totalDistanceKm: 34.2,
    startedAt: '05:30 AM Today',
    estimatedArrival: '08:45 AM Today',
    routeTrail: [
      [24.3412, 54.5123],
      [24.4120, 54.5510],
      [24.4821, 54.6041]
    ],
    epod: {
      receiverName: 'Hassan Al-Nuaimi',
      receiverPhone: '+971 50 771 9021',
      receiverRole: 'Miral Asset Facility Manager',
      signedAt: 'Today at 08:42 AM',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><path d="M 20 50 Q 60 10 90 45 T 160 30 T 200 55" stroke="%2310B981" stroke-width="3" fill="none"/></svg>',
      deliveryNotes: 'Equipment offloaded without incident. No damage to hydraulic lines. Signed & stamped.',
      consignmentNumber: 'KSP-POD-YAS-44012',
    }
  },
  {
    id: 'KSP-VEH-005',
    trackingToken: '1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    vehiclePlate: 'DXB-T-88219',
    vehicleType: 'Heavy Flatbed 50ft (Quad-Axle)',
    driverName: 'Bilal Hussain (On Duty)',
    driverPhone: '+971 54 223 9988',
    cargoDescription: 'Yard Standby (Ready for Immediate Dispatch)',
    cargoWeightTon: 0,
    cargoDimensions: '15.0m x 2.8m Flat Deck',
    transportPermit: 'GENERAL-UAE-FLEET-PERMIT',
    originName: 'Kasper Central Yard 12, Al Quoz 3, Dubai',
    originCoords: [25.1321, 55.2412],
    destinationName: 'Available for Dispatch',
    destinationCoords: [25.1321, 55.2412],
    currentCoords: [25.1321, 55.2412],
    speedKmh: 0,
    headingDeg: 0,
    batteryPct: 100,
    status: 'AVAILABLE',
    etaMinutes: 0,
    distanceRemainingKm: 0,
    totalDistanceKm: 0,
    startedAt: 'Available',
    estimatedArrival: 'Ready for Assignment',
    routeTrail: [
      [25.1321, 55.2412]
    ]
  }
];

export const FLEET_METRICS = {
  totalTrucks: 18,
  activeEnRoute: 7,
  assignedLoading: 4,
  availableYard: 7,
  onTimeRate: '98.4%',
  totalKmToday: '3,842 km',
  gpsUptime: '99.9%',
  offlineBufferedSyncs: 41
};
