export interface TripData {
  id: string;
  category: 'EQUIPMENT' | 'FREIGHT';
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
    signatureUrl?: string;
    deliveryNotes: string;
    consignmentNumber: string;
    stampedDocPhotoUrl?: string;
    offloadCargoPhotoUrl?: string;
    watermarkGps?: string;
  };
}

export const DUMMY_TRIPS: TripData[] = [
  // ==========================================
  // CATEGORY 1: HEAVY EQUIPMENT (MACHINERY)
  // ==========================================
  {
    id: 'KSP-EQ-101',
    category: 'EQUIPMENT',
    trackingToken: '8f92a1c0d4e740b2a3f912cd4e019a82',
    vehiclePlate: 'DXB-T-49102',
    vehicleType: 'Heavy Flatbed 40ft (Triple-Axle)',
    driverName: 'Rashid Khan',
    driverPhone: '+971 50 111 2233',
    cargoDescription: 'CAT 320D Hydraulic Excavator (Boom & Bucket Secured)',
    cargoWeightTon: 22.4,
    cargoDimensions: '9.5m x 3.0m x 3.1m',
    transportPermit: 'RTA-OVERSIZE-2026-9941',
    originName: 'Dubai South Logistics City, Yard 7',
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
    id: 'KSP-EQ-102',
    category: 'EQUIPMENT',
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
    id: 'KSP-EQ-103',
    category: 'EQUIPMENT',
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
      stampedDocPhotoUrl: 'preset_stamped_do',
      offloadCargoPhotoUrl: 'preset_offload_cargo',
      watermarkGps: '24.4821° N, 54.6041° E • Yas Island Theme Park Zone',
    }
  },
  {
    id: 'KSP-EQ-104',
    category: 'EQUIPMENT',
    trackingToken: '3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    vehiclePlate: 'DXB-T-71822',
    vehicleType: 'Heavy Multi-Axle Lowbed 80-Ton',
    driverName: 'Nasiruddin Shah',
    driverPhone: '+971 55 334 1199',
    cargoDescription: 'Liebherr LTM 1100 100-Ton All-Terrain Mobile Crane (Counterweights Loaded)',
    cargoWeightTon: 48.0,
    cargoDimensions: '14.2m x 3.1m x 3.8m',
    transportPermit: 'RTA-HEAVY-CRANE-ESCORT-88',
    originName: 'Al Quoz Industrial 3 Heavy Machinery Yard',
    originCoords: [25.1321, 55.2412],
    destinationName: 'Dubai Creek Harbour Tower Infrastructure Site',
    destinationCoords: [25.2014, 55.3521],
    currentCoords: [25.1650, 55.2910],
    speedKmh: 45,
    headingDeg: 65,
    batteryPct: 82,
    status: 'IN_TRANSIT',
    etaMinutes: 28,
    distanceRemainingKm: 14.5,
    totalDistanceKm: 24.0,
    startedAt: '08:45 AM Today',
    estimatedArrival: '10:30 AM Today',
    routeTrail: [
      [25.1321, 55.2412],
      [25.1500, 55.2650],
      [25.1650, 55.2910],
    ],
    epod: {
      receiverName: 'Eng. Salem Al-Suwaidi',
      receiverPhone: '+971 50 123 9876',
      receiverRole: 'Emaar Site Infrastructure Director',
      signedAt: 'Pending Delivery',
      signatureUrl: '',
      deliveryNotes: 'Police escort accompanying vehicle on Ras Al Khor Road.',
      consignmentNumber: 'KSP-POD-CRK-88120',
    }
  },

  // ==========================================
  // CATEGORY 2: COMMERCIAL FREIGHT (MATERIALS & CARGO)
  // ==========================================
  {
    id: 'KSP-FR-201',
    category: 'FREIGHT',
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
    currentCoords: [25.3210, 55.4310],
    speedKmh: 58,
    headingDeg: 195,
    batteryPct: 76,
    status: 'IN_TRANSIT',
    etaMinutes: 38,
    distanceRemainingKm: 26.5,
    totalDistanceKm: 48.0,
    startedAt: '08:15 AM Today',
    estimatedArrival: '11:00 AM Today',
    routeTrail: [
      [25.4651, 55.4981],
      [25.3910, 55.4650],
      [25.3210, 55.4310],
    ],
    epod: {
      receiverName: 'Kareem Mansoor',
      receiverPhone: '+971 56 312 8744',
      receiverRole: 'Site Construction Manager',
      signedAt: 'Pending Arrival',
      signatureUrl: '',
      deliveryNotes: 'Requires 100-ton crane on-site for immediate offloading.',
      consignmentNumber: 'KSP-POD-SHJ-33918',
    }
  },
  {
    id: 'KSP-FR-202',
    category: 'FREIGHT',
    trackingToken: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    vehiclePlate: 'DXB-T-60291',
    vehicleType: 'Container Skeletal Chassis 40ft',
    driverName: 'Imran Ashraf',
    driverPhone: '+971 52 443 8811',
    cargoDescription: '2x 20ft Shipping Containers (Import Electromechanical Spares)',
    cargoWeightTon: 28.0,
    cargoDimensions: '12.2m x 2.44m x 2.59m',
    transportPermit: 'CUSTOMS-SEALED-DPW-8812',
    originName: 'DP World Container Terminal 2, Jebel Ali Port',
    originCoords: [25.0050, 55.0600],
    destinationName: 'ICAD Industrial City Abu Dhabi, Logistics Sector',
    destinationCoords: [24.3210, 54.4980],
    currentCoords: [24.6850, 54.8210],
    speedKmh: 75,
    headingDeg: 220,
    batteryPct: 89,
    status: 'IN_TRANSIT',
    etaMinutes: 48,
    distanceRemainingKm: 58.2,
    totalDistanceKm: 102.0,
    startedAt: '07:45 AM Today',
    estimatedArrival: '11:30 AM Today',
    routeTrail: [
      [25.0050, 55.0600],
      [24.8910, 54.9810],
      [24.7810, 54.9010],
      [24.6850, 54.8210],
    ],
    epod: {
      receiverName: 'Bader Al-Hosani',
      receiverPhone: '+971 50 661 2289',
      receiverRole: 'Customs Clearing Warehouse Officer',
      signedAt: 'Pending Delivery',
      signatureUrl: '',
      deliveryNotes: 'Tamper-evident customs bolt seals verified at JAFZA exit gate.',
      consignmentNumber: 'KSP-POD-ICAD-77192',
    }
  },
  {
    id: 'KSP-FR-203',
    category: 'FREIGHT',
    trackingToken: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
    vehiclePlate: 'RAK-T-84102',
    vehicleType: 'Heavy Pipe-Carrier Flatbed (Bunk Headboard)',
    driverName: 'Kamran Siddique',
    driverPhone: '+971 50 889 4433',
    cargoDescription: 'High-Pressure Carbon Steel Gas Pipeline Spools (12-inch API 5L)',
    cargoWeightTon: 31.4,
    cargoDimensions: '15.5m x 2.4m x 2.2m',
    transportPermit: 'MOEI-DANGEROUS-HAUL-2026',
    originName: 'Ras Al Khaimah Stevin Rock Fabrication Yard',
    originCoords: [25.7890, 55.9432],
    destinationName: 'Habshan Gas Complex, Western Region Abu Dhabi',
    destinationCoords: [23.8500, 53.7500],
    currentCoords: [25.1100, 55.4500],
    speedKmh: 64,
    headingDeg: 215,
    batteryPct: 79,
    status: 'IN_TRANSIT',
    etaMinutes: 195,
    distanceRemainingKm: 220.0,
    totalDistanceKm: 310.0,
    startedAt: '05:15 AM Today',
    estimatedArrival: '02:30 PM Today',
    routeTrail: [
      [25.7890, 55.9432],
      [25.4500, 55.7000],
      [25.2800, 55.5500],
      [25.1100, 55.4500],
    ],
    epod: {
      receiverName: 'Eng. Walid Cherif',
      receiverPhone: '+971 55 901 8832',
      receiverRole: 'Pipeline QA/QC Lead Inspector, ADNOC Gas',
      signedAt: 'Pending Delivery',
      signatureUrl: '',
      deliveryNotes: 'Mill test certificates (MTC) and NDT x-ray report copies attached in transport pouch.',
      consignmentNumber: 'KSP-POD-HAB-99214',
    }
  },
  {
    id: 'KSP-FR-204',
    category: 'FREIGHT',
    trackingToken: '1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    vehiclePlate: 'DXB-T-88219',
    vehicleType: 'Heavy Flatbed 50ft (Quad-Axle)',
    driverName: 'Bilal Hussain (On Duty)',
    driverPhone: '+971 54 223 9988',
    cargoDescription: 'Structural Steel I-Beams & Reinforcement Rebar (Bundled 12m)',
    cargoWeightTon: 29.5,
    cargoDimensions: '12.0m x 2.5m x 1.8m',
    transportPermit: 'GENERAL-UAE-FLEET-PERMIT',
    originName: 'Emirates Steel Arkan Yard, Mussafah',
    originCoords: [24.3510, 54.5210],
    destinationName: 'Al Ain Logistics Park Expansion',
    destinationCoords: [24.2075, 55.7447],
    currentCoords: [24.3510, 54.5210],
    speedKmh: 0,
    headingDeg: 90,
    batteryPct: 98,
    status: 'ASSIGNED',
    etaMinutes: 90,
    distanceRemainingKm: 125.0,
    totalDistanceKm: 125.0,
    startedAt: 'Loading at Yard',
    estimatedArrival: '01:15 PM Today',
    routeTrail: [
      [24.3510, 54.5210]
    ],
    epod: {
      receiverName: 'Ibrahim Al-Kaabi',
      receiverPhone: '+971 50 441 5522',
      receiverRole: 'Al Ain Municipality Inward Logistics Officer',
      signedAt: 'Pending Loading',
      signatureUrl: '',
      deliveryNotes: 'Stanchions and nylon web tie-downs inspected. Ready for departure.',
      consignmentNumber: 'KSP-POD-ALN-33108',
    }
  }
];

export const FLEET_METRICS = {
  totalTrucks: 8,
  equipmentCount: 4,
  freightCount: 4,
  activeEnRoute: 6,
  assignedLoading: 1,
  deliveredToday: 1,
  onTimeRate: '98.8%',
  totalKmToday: '4,120 km',
  gpsUptime: '99.9%',
  offlineBufferedSyncs: 41
};
