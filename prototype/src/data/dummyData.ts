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
    signatureUrl: string;
    deliveryNotes: string;
    consignmentNumber: string;
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

// ============================================================================
// MARKETPLACE VOUCHERS (ASP.NET Core Voucher 100 / 400 Contract Mock)
// ============================================================================
export interface MarketplaceVoucher {
  headerId: number;
  voucherNo: string;
  voucherType: 100 | 200 | 300 | 400; // 100: RFQ, 400: Confirmed PO
  voucherTypeName: 'RFQ' | 'PURCHASE_ORDER';
  date: string;
  status: 0 | 1 | 2; // 0: New, 1: Approved/Confirmed, 2: Rejected
  statusName: 'NEW' | 'CONFIRMED' | 'ASSIGNED';
  customerName: string;
  customerPhone: string;
  customerTRN?: string;
  vendorId?: number;
  equipmentType: string;
  cargoDescription: string;
  cargoWeightTon: number;
  capacityRequired: string;
  originText: string;
  originCoords: [number, number];
  destinationText: string;
  destinationCoords: [number, number];
  requiredGatePass?: 'CICPA' | 'JAFZA' | 'AD_PORTS' | 'NONE';
  scheduledDate: string;
  rateAED: number;
  vatAED: number;
  netAED: number;
  remarks: string;
  assignedDriverId?: string;
  convertedTripId?: string;
}

export const DUMMY_MARKETPLACE_VOUCHERS: MarketplaceVoucher[] = [
  {
    headerId: 1042,
    voucherNo: 'PO-2026-0042',
    voucherType: 400,
    voucherTypeName: 'PURCHASE_ORDER',
    date: '2026-11-02',
    status: 1,
    statusName: 'CONFIRMED',
    customerName: 'Al Naboodah Contracting LLC',
    customerPhone: '+971 50 554 4332',
    customerTRN: '100293847500003',
    vendorId: 28,
    equipmentType: 'Flatbed Trailer 40ft',
    cargoDescription: 'Structural Steel I-Beams (12m Bundles)',
    cargoWeightTon: 28.5,
    capacityRequired: '40 Ton',
    originText: 'Dubai Industrial City, Yard 12',
    originCoords: [24.8450, 55.0812],
    destinationText: 'Khalifa Port Container Terminal 2, Abu Dhabi',
    destinationCoords: [24.8123, 54.6931],
    requiredGatePass: 'AD_PORTS',
    scheduledDate: '2026-11-04',
    rateAED: 2500.00,
    vatAED: 125.00,
    netAED: 2625.00,
    remarks: 'Freight › Flatbed Trailer · Route: Dubai Industrial City → Khalifa Port, Abu Dhabi · Capacity: 40 Ton · Cargo: Structural steel beams · Pickup: 2026-11-04'
  },
  {
    headerId: 1045,
    voucherNo: 'PO-2026-0045',
    voucherType: 400,
    voucherTypeName: 'PURCHASE_ORDER',
    date: '2026-11-02',
    status: 1,
    statusName: 'CONFIRMED',
    customerName: 'Petrofac International EPC',
    customerPhone: '+971 50 998 1234',
    customerTRN: '100481920300003',
    vendorId: 28,
    equipmentType: 'Lowbed 60-Ton (Hydraulic)',
    cargoDescription: 'CAT 966H Heavy Wheel Loader (With Rock Bucket)',
    cargoWeightTon: 25.4,
    capacityRequired: '60 Ton',
    originText: 'Jebel Ali Freezone (JAFZA South), Gate 4 Yard',
    originCoords: [24.9857, 55.0743],
    destinationText: 'Ruwais Refinery Expansion Sector 4, Abu Dhabi',
    destinationCoords: [24.1120, 52.7310],
    requiredGatePass: 'CICPA',
    scheduledDate: '2026-11-05',
    rateAED: 4000.00,
    vatAED: 200.00,
    netAED: 4200.00,
    remarks: 'Heavy Haul › Lowbed 60-Ton · Route: JAFZA Gate 4 → Ruwais Sector 4 · CICPA Security Clearance Mandatory · Pickup: 2026-11-05'
  },
  {
    headerId: 1081,
    voucherNo: 'RFQ-2026-0081',
    voucherType: 100,
    voucherTypeName: 'RFQ',
    date: '2026-11-02',
    status: 0,
    statusName: 'NEW',
    customerName: 'Drydocks World Dubai LLC',
    customerPhone: '+971 50 332 9911',
    customerTRN: '100192837400003',
    equipmentType: 'Boom Truck 10-Ton',
    cargoDescription: '4x Industrial Oil-Cooled Transformers (2.2T each)',
    cargoWeightTon: 8.8,
    capacityRequired: '10 Ton',
    originText: 'Sharjah Industrial Area 10, Al Wahda Yard',
    originCoords: [25.3120, 55.4050],
    destinationText: 'Dubai Maritime City Marine Berths, Dubai',
    destinationCoords: [25.2650, 55.2710],
    requiredGatePass: 'NONE',
    scheduledDate: '2026-11-06',
    rateAED: 1800.00,
    vatAED: 90.00,
    netAED: 1890.00,
    remarks: 'Freight Inquiry › Boom Truck 10-Ton with 14m Crane · Route: Sharjah Ind 10 → Dubai Maritime City · Self-loading capability required'
  },
  {
    headerId: 1039,
    voucherNo: 'PO-2026-0039',
    voucherType: 400,
    voucherTypeName: 'PURCHASE_ORDER',
    date: '2026-11-02',
    status: 1,
    statusName: 'ASSIGNED',
    customerName: 'Al Naboodah Contracting LLC',
    customerPhone: '+971 50 554 4332',
    vendorId: 28,
    equipmentType: 'Heavy Flatbed 40ft (Triple-Axle)',
    cargoDescription: 'CAT 320D Hydraulic Excavator',
    cargoWeightTon: 22.4,
    capacityRequired: '40 Ton',
    originText: 'Dubai South Logistics City, Yard 7',
    originCoords: [24.8934, 55.1582],
    destinationText: 'Abu Dhabi Saadiyat Cultural District (Louvre Phase 2)',
    destinationCoords: [24.5332, 54.4021],
    requiredGatePass: 'NONE',
    scheduledDate: '2026-11-02',
    rateAED: 3200.00,
    vatAED: 160.00,
    netAED: 3360.00,
    remarks: 'Active Haulage › Assigned to Driver Rashid Khan · Trip KSP-EQ-101',
    assignedDriverId: 'DRV-101',
    convertedTripId: 'KSP-EQ-101'
  }
];

// ============================================================================
// DRIVERS DIRECTORY & COMPLIANCE RECORDS (KYC)
// ============================================================================
export interface DriverProfile {
  id: string;
  fullName: string;
  phone: string;
  preferredLanguage: 'EN' | 'AR' | 'UR';
  licenseNumber: string;
  licenseCategory: 'Heavy Truck' | 'Articulated Trailer' | 'Light Vehicle' | 'Heavy Equipment Operator';
  licenseExpiry: string; // YYYY-MM-DD
  licenseIssuingAuthority: string; // RTA Dubai, ITC Abu Dhabi, Sharjah RTA
  emiratesId: string;
  emiratesIdExpiry: string;
  assignedVehiclePlate: string;
  vehicleType: string;
  maxPayloadTons: number;
  carrierCompany: string; // In-house or Subcontractor Transporter
  gatePasses: ('CICPA' | 'JAFZA' | 'AD_PORTS')[];
  status: 'AVAILABLE' | 'ON_TRIP' | 'BLOCKED_CALENDAR' | 'EXPIRED_DOCS';
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  currentTripId?: string;
  rating: number;
  totalTripsCompleted: number;
}

export const DUMMY_DRIVERS: DriverProfile[] = [
  {
    id: 'DRV-101',
    fullName: 'Rashid Khan',
    phone: '+971 50 111 2233',
    preferredLanguage: 'EN',
    licenseNumber: 'DXB-HV-99214',
    licenseCategory: 'Articulated Trailer',
    licenseExpiry: '2027-08-20',
    licenseIssuingAuthority: 'RTA Dubai',
    emiratesId: '784-1988-1294819-1',
    emiratesIdExpiry: '2027-06-15',
    assignedVehiclePlate: 'DXB-T-49102',
    vehicleType: 'Heavy Flatbed 40ft (Triple-Axle)',
    maxPayloadTons: 40.0,
    carrierCompany: 'Kasper Direct Fleet',
    gatePasses: ['CICPA', 'JAFZA'],
    status: 'ON_TRIP',
    verificationStatus: 'VERIFIED',
    currentTripId: 'KSP-EQ-101',
    rating: 4.95,
    totalTripsCompleted: 142
  },
  {
    id: 'DRV-102',
    fullName: 'Tariq Mehmood',
    phone: '+971 50 445 7890',
    preferredLanguage: 'UR',
    licenseNumber: 'AUH-HV-88120',
    licenseCategory: 'Heavy Equipment Operator',
    licenseExpiry: '2027-03-12',
    licenseIssuingAuthority: 'ITC Abu Dhabi',
    emiratesId: '784-1985-9928102-3',
    emiratesIdExpiry: '2026-12-10',
    assignedVehiclePlate: 'AUH-T-12891',
    vehicleType: 'Lowbed 60-Ton (Hydraulic Gooseneck)',
    maxPayloadTons: 60.0,
    carrierCompany: 'Al Faris Heavy Haulage Subcontractor',
    gatePasses: ['CICPA', 'AD_PORTS'],
    status: 'ON_TRIP',
    verificationStatus: 'VERIFIED',
    currentTripId: 'KSP-EQ-102',
    rating: 4.88,
    totalTripsCompleted: 89
  },
  {
    id: 'DRV-103',
    fullName: 'Sajid Ali',
    phone: '+971 50 333 4455',
    preferredLanguage: 'UR',
    licenseNumber: 'SHJ-HV-77319',
    licenseCategory: 'Heavy Truck',
    licenseExpiry: '2027-11-30',
    licenseIssuingAuthority: 'Sharjah RTA',
    emiratesId: '784-1991-3819201-2',
    emiratesIdExpiry: '2027-09-01',
    assignedVehiclePlate: 'SHJ-T-55194',
    vehicleType: 'Boom Truck 10-Ton',
    maxPayloadTons: 10.0,
    carrierCompany: 'Gulf Cranes & Transport LLC',
    gatePasses: ['JAFZA'],
    status: 'AVAILABLE',
    verificationStatus: 'VERIFIED',
    rating: 4.92,
    totalTripsCompleted: 114
  },
  {
    id: 'DRV-104',
    fullName: 'Faisal Mahmood',
    phone: '+971 50 771 9922',
    preferredLanguage: 'AR',
    licenseNumber: 'AUH-HV-66104',
    licenseCategory: 'Articulated Trailer',
    licenseExpiry: '2028-01-14',
    licenseIssuingAuthority: 'ITC Abu Dhabi',
    emiratesId: '784-1986-7718293-4',
    emiratesIdExpiry: '2027-10-18',
    assignedVehiclePlate: 'AUH-T-39182',
    vehicleType: 'Lowbed 60-Ton (Hydraulic)',
    maxPayloadTons: 65.0,
    carrierCompany: 'Kasper Direct Fleet',
    gatePasses: ['CICPA', 'JAFZA', 'AD_PORTS'],
    status: 'AVAILABLE',
    verificationStatus: 'VERIFIED',
    rating: 4.97,
    totalTripsCompleted: 168
  },
  {
    id: 'DRV-105',
    fullName: 'Noor Ullah',
    phone: '+971 54 882 1092',
    preferredLanguage: 'EN',
    licenseNumber: 'DXB-HV-44012',
    licenseCategory: 'Heavy Truck',
    licenseExpiry: '2026-12-30',
    licenseIssuingAuthority: 'RTA Dubai',
    emiratesId: '784-1993-2281920-5',
    emiratesIdExpiry: '2027-02-28',
    assignedVehiclePlate: 'DXB-T-71920',
    vehicleType: 'Flatbed Trailer 40ft',
    maxPayloadTons: 40.0,
    carrierCompany: 'Kasper Direct Fleet',
    gatePasses: ['JAFZA'],
    status: 'BLOCKED_CALENDAR',
    verificationStatus: 'VERIFIED',
    rating: 4.79,
    totalTripsCompleted: 62
  }
];

// ============================================================================
// DRIVER CALENDAR & SCHEDULE MATRIX
// ============================================================================
export interface DriverScheduleBlock {
  id: string;
  driverId: string;
  driverName: string;
  date: string; // YYYY-MM-DD
  timeWindow: string; // e.g. "08:00 - 18:00"
  type: 'TRIP_BOOKED' | 'MAINTENANCE' | 'REST_PERIOD' | 'PERSONAL_LEAVE';
  typeName: 'Trip Booked' | 'Truck Service' | 'Mandatory Rest' | 'Personal Leave';
  title: string;
  tripCode?: string;
  poNumber?: string;
  notes?: string;
}

export const DUMMY_DRIVER_SCHEDULES: DriverScheduleBlock[] = [
  {
    id: 'SCH-001',
    driverId: 'DRV-101',
    driverName: 'Rashid Khan',
    date: '2026-11-02',
    timeWindow: '07:30 - 14:00',
    type: 'TRIP_BOOKED',
    typeName: 'Trip Booked',
    title: 'KSP-EQ-101 · CAT 320D Excavator',
    tripCode: 'KSP-EQ-101',
    poNumber: 'PO-2026-0039',
    notes: 'In-Transit from Dubai South to Saadiyat Cultural District'
  },
  {
    id: 'SCH-002',
    driverId: 'DRV-101',
    driverName: 'Rashid Khan',
    date: '2026-11-03',
    timeWindow: '10:00 - 16:00',
    type: 'MAINTENANCE',
    typeName: 'Truck Service',
    title: 'Scheduled 50,000 km Brake & Air Line Service',
    notes: 'Al Quoz Heavy Commercial Workshop Yard 3'
  },
  {
    id: 'SCH-003',
    driverId: 'DRV-102',
    driverName: 'Tariq Mehmood',
    date: '2026-11-02',
    timeWindow: '06:00 - 18:00',
    type: 'TRIP_BOOKED',
    typeName: 'Trip Booked',
    title: 'KSP-EQ-102 · Cummins 500kVA Generator',
    tripCode: 'KSP-EQ-102',
    poNumber: 'PO-2026-0037',
    notes: 'Ruwais Refinery Long Haul (CICPA pass authenticated)'
  },
  {
    id: 'SCH-004',
    driverId: 'DRV-105',
    driverName: 'Noor Ullah',
    date: '2026-11-02',
    timeWindow: '00:00 - 23:59',
    type: 'PERSONAL_LEAVE',
    typeName: 'Personal Leave',
    title: 'Annual Visa Medical & Emirates ID Biometrics',
    notes: 'Unavailable all day'
  },
  {
    id: 'SCH-005',
    driverId: 'DRV-103',
    driverName: 'Sajid Ali',
    date: '2026-11-03',
    timeWindow: '08:00 - 15:00',
    type: 'REST_PERIOD',
    typeName: 'Mandatory Rest',
    title: 'Driver Fatigue Regulatory Rest',
    notes: 'Required after continuous night shift'
  }
];

// ============================================================================
// DRIVER FINANCIAL EARNINGS LEDGER
// ============================================================================
export interface DriverEarningsRecord {
  id: string;
  driverId: string;
  tripCode: string;
  poNumber: string;
  completedDate: string;
  cargoTitle: string;
  route: string;
  baseFareAED: number;
  waitingHours: number;
  waitingRateHourlyAED: number;
  demurrageTotalAED: number;
  salikTollsAED: number;
  totalPayoutAED: number;
  status: 'APPROVED' | 'PENDING_EPOD' | 'DISBURSED';
  payoutDate?: string;
}

export const DUMMY_DRIVER_EARNINGS: DriverEarningsRecord[] = [
  {
    id: 'ERN-401',
    driverId: 'DRV-101',
    tripCode: 'KSP-EQ-101',
    poNumber: 'PO-2026-0042',
    completedDate: '2026-11-02',
    cargoTitle: 'CAT 320D Excavator',
    route: 'Dubai South → Saadiyat Cultural District',
    baseFareAED: 2200.00,
    waitingHours: 2.5,
    waitingRateHourlyAED: 100.00,
    demurrageTotalAED: 250.00,
    salikTollsAED: 16.00,
    totalPayoutAED: 2466.00,
    status: 'APPROVED',
    payoutDate: '2026-11-06'
  },
  {
    id: 'ERN-398',
    driverId: 'DRV-101',
    tripCode: 'KSP-FR-201',
    poNumber: 'PO-2026-0038',
    completedDate: '2026-10-31',
    cargoTitle: 'Precast Bridge Girders',
    route: 'JAFZA South → Ruwais Industrial',
    baseFareAED: 3100.00,
    waitingHours: 1.0,
    waitingRateHourlyAED: 100.00,
    demurrageTotalAED: 100.00,
    salikTollsAED: 12.00,
    totalPayoutAED: 3212.00,
    status: 'DISBURSED',
    payoutDate: '2026-10-31'
  },
  {
    id: 'ERN-405',
    driverId: 'DRV-101',
    tripCode: 'KSP-EQ-101',
    poNumber: 'PO-2026-0042',
    completedDate: '2026-11-03',
    cargoTitle: 'Active En-Route Consignment',
    route: 'Dubai South → Abu Dhabi',
    baseFareAED: 2500.00,
    waitingHours: 0,
    waitingRateHourlyAED: 100.00,
    demurrageTotalAED: 0,
    salikTollsAED: 8.00,
    totalPayoutAED: 2508.00,
    status: 'PENDING_EPOD'
  }
];

// ============================================================================
// FLEET OWNER / TRANSPORTER ENTITIES & BACKHAUL DIRECTORY
// ============================================================================
export interface FleetVehicle {
  plate: string;
  type: string;
  payloadTons: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  assignedDriverName?: string;
  activeTripCode?: string;
  gatePasses: ('CICPA' | 'JAFZA' | 'AD_PORTS')[];
}

export interface FleetOwner {
  id: string;
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  trnNumber: string; // UAE 5% Tax Registration Number
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankIBAN: string;
  bankName: string;
  marketplaceVendorId: number; // Links to ASP.NET Core Account (accountType: 3)
  totalTrucks: number;
  activeOnTrip: number;
  idleInYard: number;
  inMaintenance: number;
  totalGrossRevenueAED: number;
  pendingPayoutAED: number;
  disbursedAED: number;
  vehicles: FleetVehicle[];
  upcomingAssignedTrips: {
    tripId: string;
    voucherNo: string;
    customer: string;
    corridor: string;
    scheduledDate: string;
    netAmountAED: number;
    assignedDriver?: string;
    assignedPlate?: string;
    status: 'PENDING_DELEGATION' | 'DISPATCHED' | 'IN_TRANSIT';
  }[];
}

export const DUMMY_FLEET_OWNERS: FleetOwner[] = [
  {
    id: 'FLT-001',
    companyName: 'Al Faris Heavy Transport & Rigging LLC',
    tradeLicenseNo: 'DXB-TL-581920',
    tradeLicenseExpiry: '2027-09-15',
    trnNumber: '100492810400003',
    contactPerson: 'Sultan Al-Marzooqi (Fleet Manager)',
    contactPhone: '+971 4 885 9922',
    contactEmail: 'dispatch@alfarisheavy.ae',
    bankIBAN: 'AE2903312000000948210492',
    bankName: 'Emirates NBD',
    marketplaceVendorId: 28,
    totalTrucks: 8,
    activeOnTrip: 5,
    idleInYard: 2,
    inMaintenance: 1,
    totalGrossRevenueAED: 68450.00,
    pendingPayoutAED: 14850.00,
    disbursedAED: 53600.00,
    vehicles: [
      { plate: 'DXB-T-49102', type: 'Heavy Flatbed 40ft (Triple-Axle)', payloadTons: 40.0, status: 'ON_TRIP', assignedDriverName: 'Rashid Khan', activeTripCode: 'KSP-EQ-101', gatePasses: ['CICPA', 'JAFZA'] },
      { plate: 'AUH-T-12891', type: 'Lowbed 60-Ton (Hydraulic Gooseneck)', payloadTons: 60.0, status: 'ON_TRIP', assignedDriverName: 'Tariq Mehmood', activeTripCode: 'KSP-EQ-102', gatePasses: ['CICPA', 'AD_PORTS'] },
      { plate: 'DXB-T-60291', type: 'Container Skeletal Chassis 40ft', payloadTons: 35.0, status: 'ON_TRIP', assignedDriverName: 'Imran Ashraf', activeTripCode: 'KSP-FR-202', gatePasses: ['JAFZA', 'AD_PORTS'] },
      { plate: 'RAK-T-84102', type: 'Heavy Pipe-Carrier Flatbed', payloadTons: 45.0, status: 'ON_TRIP', assignedDriverName: 'Kamran Siddique', activeTripCode: 'KSP-FR-203', gatePasses: ['CICPA'] },
      { plate: 'DXB-T-88219', type: 'Heavy Flatbed 50ft (Quad-Axle)', payloadTons: 50.0, status: 'ON_TRIP', assignedDriverName: 'Bilal Hussain', activeTripCode: 'KSP-FR-204', gatePasses: ['JAFZA', 'AD_PORTS'] },
      { plate: 'AUH-T-39182', type: 'Lowbed 80-Ton Heavy Haul', payloadTons: 80.0, status: 'AVAILABLE', assignedDriverName: 'Faisal Mahmood', gatePasses: ['CICPA', 'JAFZA', 'AD_PORTS'] },
      { plate: 'SHJ-T-55194', type: 'Boom Truck 10-Ton with Crane', payloadTons: 10.0, status: 'AVAILABLE', assignedDriverName: 'Sajid Ali', gatePasses: ['JAFZA'] },
      { plate: 'DXB-T-71920', type: 'Flatbed Trailer 40ft', payloadTons: 40.0, status: 'MAINTENANCE', gatePasses: ['JAFZA'] },
    ],
    upcomingAssignedTrips: [
      {
        tripId: 'KSP-TR-3012',
        voucherNo: 'PO-2026-0042',
        customer: 'Al Naboodah Contracting LLC',
        corridor: 'Dubai Industrial City → Khalifa Port, Abu Dhabi',
        scheduledDate: '2026-11-04',
        netAmountAED: 2625.00,
        assignedDriver: 'Rashid Khan',
        assignedPlate: 'DXB-T-49102',
        status: 'DISPATCHED'
      },
      {
        tripId: 'KSP-TR-3015',
        voucherNo: 'PO-2026-0045',
        customer: 'Petrofac International EPC',
        corridor: 'JAFZA Gate 4 → Ruwais Sector 4 (Requires CICPA)',
        scheduledDate: '2026-11-05',
        netAmountAED: 4200.00,
        status: 'PENDING_DELEGATION'
      }
    ]
  }
];

// ============================================================================
// CORRIDOR RETURN LOAD / BACKHAUL LEADS (DEADHEAD ELIMINATION)
// ============================================================================
export interface BackhaulLead {
  id: string;
  unloadedLocation: string;
  returnPickupCity: string;
  returnDropCity: string;
  cargoDescription: string;
  cargoWeightTon: number;
  offeredRateAED: number;
  deadheadKmSaved: number;
  linkedMarketplaceRfqNo: string;
  urgency: 'HIGH' | 'MEDIUM';
}

export const DUMMY_BACKHAUL_LEADS: BackhaulLead[] = [
  {
    id: 'BKL-901',
    unloadedLocation: 'Ruwais Industrial Complex, Abu Dhabi',
    returnPickupCity: 'Barakah / Ruwais Sector 2',
    returnDropCity: 'Jebel Ali Industrial 1, Dubai',
    cargoDescription: 'Empty 40ft Rig Modules & Rebar Stanchions',
    cargoWeightTon: 18.0,
    offeredRateAED: 2400.00,
    deadheadKmSaved: 235,
    linkedMarketplaceRfqNo: 'RFQ-2026-0094',
    urgency: 'HIGH'
  },
  {
    id: 'BKL-902',
    unloadedLocation: 'Saadiyat Cultural District, Abu Dhabi',
    returnPickupCity: 'Mussafah Industrial Yard 4',
    returnDropCity: 'Sharjah Industrial 10',
    cargoDescription: 'Structural Steel Scaffolding & Formwork',
    cargoWeightTon: 22.0,
    offeredRateAED: 1850.00,
    deadheadKmSaved: 140,
    linkedMarketplaceRfqNo: 'RFQ-2026-0099',
    urgency: 'MEDIUM'
  }
];

// ============================================================================
// TOLL GANTRIES (SALIK & DARB) DETECTED EVENTS
// ============================================================================
export interface TollGantryEvent {
  id: string;
  gantryName: string;
  system: 'SALIK' | 'DARB';
  tollRateAED: number;
  detectedAt: string;
  coordinates: [number, number];
  tripCode: string;
  reimbursementStatus: 'AUTO_REFUNDED' | 'AUDITING';
}

export const DUMMY_TOLL_EVENTS: TollGantryEvent[] = [
  { id: 'TLL-01', gantryName: 'Jebel Ali Toll Gate', system: 'SALIK', tollRateAED: 4.00, detectedAt: '08:14 Today', coordinates: [24.9812, 55.0921], tripCode: 'KSP-EQ-101', reimbursementStatus: 'AUTO_REFUNDED' },
  { id: 'TLL-02', gantryName: 'Sheikh Khalifa Bridge', system: 'DARB', tollRateAED: 4.00, detectedAt: '10:02 Today', coordinates: [24.5210, 54.4120], tripCode: 'KSP-EQ-101', reimbursementStatus: 'AUTO_REFUNDED' },
  { id: 'TLL-03', gantryName: 'Airport Tunnel Gate', system: 'SALIK', tollRateAED: 4.00, detectedAt: '06:45 Today', coordinates: [25.2612, 55.3512], tripCode: 'KSP-FR-202', reimbursementStatus: 'AUTO_REFUNDED' },
];


