'use client';

import React, { useState } from 'react';
import { 
  TripData, FLEET_METRICS, DriverProfile, DriverScheduleBlock, 
  MarketplaceVoucher, DUMMY_DRIVERS, DUMMY_DRIVER_SCHEDULES, 
  DUMMY_MARKETPLACE_VOUCHERS 
} from '../data/dummyData';
import InteractiveMap from './InteractiveMap';
import DriverOnboardingModal from './DriverOnboardingModal';
import MarketplaceBridgeView from './MarketplaceBridgeView';
import DemurrageCertificateModal from './DemurrageCertificateModal';
import WhatsAppDispatchModal from './WhatsAppDispatchModal';
import { 
  Truck, ShieldCheck, MapPin, Gauge, Radio, Play, Pause, 
  RotateCcw, CheckCircle2, AlertTriangle, FileText, Plus,
  Search, ExternalLink, BatteryCharging, UserCheck, Eye, Layers,
  Calendar, DollarSign, Sparkles, Phone, ArrowRight, MessageSquare, Printer
} from './Icons';

interface OpsAdminViewProps {
  trips: TripData[];
  onSelectTripForCustomerView?: (token: string) => void;
  onSelectTripForDriverView?: (tripId: string) => void;
  onAddTrip?: (newTrip: TripData) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  theme?: 'light' | 'dark';
}

type OpsTab = 'FLEET_MAP' | 'MARKETPLACE' | 'DRIVERS' | 'SCHEDULES';

export default function OpsAdminView({
  trips,
  onSelectTripForCustomerView,
  onSelectTripForDriverView,
  onAddTrip,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  theme = 'light'
}: OpsAdminViewProps) {
  const isLight = theme === 'light';
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<OpsTab>('FLEET_MAP');
  
  // Master Datasets State
  const [drivers, setDrivers] = useState<DriverProfile[]>(DUMMY_DRIVERS);
  const [schedules, setSchedules] = useState<DriverScheduleBlock[]>(DUMMY_DRIVER_SCHEDULES);
  const [vouchers, setVouchers] = useState<MarketplaceVoucher[]>(DUMMY_MARKETPLACE_VOUCHERS);
  
  // Modals & Inspectors
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [inspectEpodTrip, setInspectEpodTrip] = useState<TripData | null>(null);
  const [showDemurrageModal, setShowDemurrageModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isPeakBanActive, setIsPeakBanActive] = useState(false);
  
  // Fleet Map Filters
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || 'KSP-EQ-101');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'EQUIPMENT' | 'FREIGHT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TRANSIT' | 'ASSIGNED' | 'DELIVERED'>('ALL');
  const [search, setSearch] = useState('');

  // Handle adding a newly onboarded driver
  const handleAddDriver = (newDriver: DriverProfile) => {
    setDrivers(prev => [newDriver, ...prev]);
    alert(`Driver ${newDriver.fullName} successfully onboarded with license ${newDriver.licenseNumber}!`);
  };

  // Handle converting a Marketplace PO/RFQ into an active trip
  const handleDispatchVoucher = (voucher: MarketplaceVoucher, selectedDriver: DriverProfile) => {
    const generatedTripId = `KSP-DISP-${voucher.headerId}`;
    const generatedToken = `trk_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;

    // 1. Update Voucher
    setVouchers(prev =>
      prev.map(v =>
        v.headerId === voucher.headerId
          ? {
              ...v,
              status: 1,
              statusName: 'ASSIGNED',
              assignedDriverId: selectedDriver.id,
              convertedTripId: generatedTripId
            }
          : v
      )
    );

    // 2. Lock Driver Calendar Schedule
    const newScheduleBlock: DriverScheduleBlock = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      driverId: selectedDriver.id,
      driverName: selectedDriver.fullName,
      date: voucher.scheduledDate,
      timeWindow: '08:00 - 18:00',
      type: 'TRIP_BOOKED',
      typeName: 'Trip Booked',
      title: `${generatedTripId} · ${voucher.cargoDescription}`,
      tripCode: generatedTripId,
      poNumber: voucher.voucherNo,
      notes: `Corridor: ${voucher.originText} → ${voucher.destinationText}`
    };
    setSchedules(prev => [newScheduleBlock, ...prev]);

    // 3. Update Driver Status to ON_TRIP
    setDrivers(prev =>
      prev.map(d =>
        d.id === selectedDriver.id
          ? { ...d, status: 'ON_TRIP', currentTripId: generatedTripId }
          : d
      )
    );

    // 4. Create new Trip in master fleet
    const newTrip: TripData = {
      id: generatedTripId,
      category: voucher.cargoWeightTon > 20 ? 'EQUIPMENT' : 'FREIGHT',
      trackingToken: generatedToken,
      vehiclePlate: selectedDriver.assignedVehiclePlate,
      vehicleType: selectedDriver.vehicleType,
      driverName: selectedDriver.fullName,
      driverPhone: selectedDriver.phone,
      cargoDescription: voucher.cargoDescription,
      cargoWeightTon: voucher.cargoWeightTon,
      cargoDimensions: 'Standard ISO Haulage Specs',
      transportPermit: `RTA-LPO-${voucher.voucherNo}`,
      originName: voucher.originText,
      originCoords: voucher.originCoords,
      destinationName: voucher.destinationText,
      destinationCoords: voucher.destinationCoords,
      currentCoords: voucher.originCoords,
      speedKmh: 0,
      headingDeg: 180,
      batteryPct: 95,
      status: 'ASSIGNED',
      etaMinutes: 120,
      distanceRemainingKm: 110,
      totalDistanceKm: 110,
      startedAt: 'Just Dispatched',
      estimatedArrival: '16:00 Today',
      routeTrail: [voucher.originCoords]
    };

    if (onAddTrip) {
      onAddTrip(newTrip);
    }

    setSelectedTripId(generatedTripId);
    setActiveTab('FLEET_MAP');
    alert(`Order ${voucher.voucherNo} successfully booked & dispatched to ${selectedDriver.fullName}! Live tracking token: ${generatedToken}`);
  };

  const filteredTrips = trips.filter(trip => {
    if (categoryFilter !== 'ALL' && trip.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && trip.status !== statusFilter) return false;
    if (search && !trip.vehiclePlate.toLowerCase().includes(search.toLowerCase()) &&
        !trip.driverName.toLowerCase().includes(search.toLowerCase()) &&
        !trip.cargoDescription.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedTrip = trips.find(t => t.id === selectedTripId) || filteredTrips[0] || trips[0];

  return (
    <div className="space-y-4">
      {/* Top Banner & Global Simulation Bar */}
      <div className={`rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isLight
          ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
          : 'bg-slate-900 border border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base tracking-wide">KASPER OPS TELEMATICS DISPATCH</h2>
              <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                STANDALONE TELEMETRY CORE
              </span>
            </div>
            <p className="text-slate-500 text-xs">Trip-Gated Privacy Architecture • Dual-Process SQLite Buffer • Zero Teltonika Hardware</p>
          </div>
        </div>

        {/* Action Controls & Simulation Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Cloud Dispatch Simulation */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Dispatch Alert</span>
          </button>

          {/* Demurrage Proof Certificate */}
          <button
            onClick={() => setShowDemurrageModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>Demurrage Audit Proof</span>
          </button>

          {/* Live Simulation Control Panel for Founder Demo */}
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <span className="text-slate-500 px-1 font-mono font-bold text-[11px]">STREAM:</span>
            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Pause' : 'Start Live Telemetry'}
            </button>
            <button
              onClick={onResetSimulation}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-colors ${
                isLight ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* UAE Heavy Haul Corridor Restrictions & Peak Hour Advisory Bar */}
      <div className={`p-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
        isPeakBanActive
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-300'
          : isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isPeakBanActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></div>
          <div>
            <span className="font-bold">
              {isPeakBanActive ? '⛔ RTA / ITC HEAVY HAUL BAN ACTIVE (Peak Hours 06:30-08:30)' : '🟢 UAE HIGHWAY CORRIDORS OPEN (E11 / E311 / E611)'}
            </span>
            <span className="text-[11px] block text-slate-500">
              {isPeakBanActive 
                ? 'Loads >40T & Lowbeds prohibited on Dubai urban highways. Night convoy escort permit required (22:00-05:00).'
                : 'Next heavy vehicle restriction window: 13:00 - 15:00 GST. All corridor permits verified.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border text-[10px] font-bold">
            Permit: RTA-OVERSIZE-2026-9941
          </span>
          <button
            onClick={() => setIsPeakBanActive(!isPeakBanActive)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              isPeakBanActive ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPeakBanActive ? 'Disable Peak Ban Simulation' : 'Simulate RTA Peak Ban'}
          </button>
        </div>
      </div>

      {/* OPS ADMIN MASTER NAVIGATION TABS */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 transition-colors ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('FLEET_MAP')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'FLEET_MAP'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Live Fleet Telematics & Map</span>
          </button>

          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'MARKETPLACE'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Marketplace Orders ({vouchers.filter(v => !v.assignedDriverId).length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVERS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'DRIVERS'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Driver Onboarding & KYC ({drivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULES')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'SCHEDULES'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Driver Calendar Matrix</span>
          </button>
        </div>

        {/* Global Action: Onboard New Driver Button */}
        <button
          onClick={() => setShowOnboardModal(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Onboard New Driver</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: LIVE FLEET MAP & DISPATCH BOARD */}
      {/* ======================================================== */}
      {activeTab === 'FLEET_MAP' && (
        <div className="space-y-4">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-slate-500 font-mono text-[10px] font-bold">TOTAL TRUCKS MONITORED</div>
              <div className="text-xl font-black mt-1">{trips.length} Fleet Units</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">100% Smartphone Telematics</div>
            </div>
            <div className={`p-3.5 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-slate-500 font-mono text-[10px] font-bold">ACTIVE HIGHWAY HAULS</div>
              <div className="text-xl font-black mt-1 text-amber-500">
                {trips.filter(t => t.status === 'IN_TRANSIT').length} In Transit
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">5-Sec Breadcrumb Flush</div>
            </div>
            <div className={`p-3.5 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-slate-500 font-mono text-[10px] font-bold">AT YARD / ASSIGNED</div>
              <div className="text-xl font-black mt-1 text-blue-500">
                {trips.filter(t => t.status === 'ASSIGNED').length} Loading
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pre-Trip Inspection Done</div>
            </div>
            <div className={`p-3.5 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-slate-500 font-mono text-[10px] font-bold">DELIVERED & SIGNED EPOD</div>
              <div className="text-xl font-black mt-1 text-emerald-600">
                {trips.filter(t => t.status === 'DELIVERED').length} Completed
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">GPS Tracking Stopped</div>
            </div>
          </div>

          {/* Map + Dispatcher Master Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left 8 Cols: Interactive Map */}
            <div className="lg:col-span-8 space-y-3">
              <div className={`p-2.5 rounded-3xl border overflow-hidden shadow-lg transition-colors ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="h-[460px] rounded-2xl overflow-hidden relative">
                  <InteractiveMap
                    trips={filteredTrips}
                    selectedTripId={selectedTripId}
                    onSelectTrip={id => setSelectedTripId(id)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Selected Trip Details Bar */}
              {selectedTrip && (
                <div className={`p-4 rounded-3xl border space-y-3 transition-colors ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-xs">
                        {selectedTrip.vehiclePlate}
                      </span>
                      <span className="font-black text-sm">{selectedTrip.cargoDescription}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {onSelectTripForCustomerView && (
                        <button
                          onClick={() => onSelectTripForCustomerView(selectedTrip.trackingToken)}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-500/25 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Customer Live Track Link</span>
                        </button>
                      )}
                      {onSelectTripForDriverView && (
                        <button
                          onClick={() => onSelectTripForDriverView(selectedTrip.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-slate-700 dark:text-slate-300"
                        >
                          Driver Phone View ➔
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">DRIVER</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedTrip.driverName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">LIVE SPEED</span>
                      <strong className="text-emerald-600 font-mono">{selectedTrip.speedKmh} km/h</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">BATTERY</span>
                      <strong className="text-blue-600 font-mono">{selectedTrip.batteryPct.toFixed(0)}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">ESTIMATED ARRIVAL</span>
                      <strong className="text-amber-600">{selectedTrip.estimatedArrival}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Fleet Vehicle Roster */}
            <div className={`lg:col-span-4 p-4 rounded-3xl border space-y-3 transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm">Active Fleet Roster</h3>
                <span className="text-xs font-mono font-bold text-slate-400">{filteredTrips.length} Listed</span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by plate, driver, cargo..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Roster List */}
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredTrips.map(trip => {
                  const isSelected = trip.id === selectedTripId;
                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-slate-900 dark:text-white">{trip.vehiclePlate}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                          trip.status === 'IN_TRANSIT'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : trip.status === 'ASSIGNED'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {trip.cargoDescription}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>{trip.driverName}</span>
                        <span>{trip.speedKmh} km/h • {trip.etaMinutes}m ETA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MARKETPLACE ORDERS & RFQ/PO DISPATCH */}
      {/* ======================================================== */}
      {activeTab === 'MARKETPLACE' && (
        <MarketplaceBridgeView
          vouchers={vouchers}
          drivers={drivers}
          schedules={schedules}
          onDispatchVoucher={handleDispatchVoucher}
          theme={theme}
        />
      )}

      {/* ======================================================== */}
      {/* SECTION 3: DRIVER ONBOARDING & COMPLIANCE ROSTER */}
      {/* ======================================================== */}
      {activeTab === 'DRIVERS' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border transition-colors flex items-center justify-between gap-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <h3 className="font-black text-base">VERIFIED DRIVER & TRANSPORTER DIRECTORY</h3>
              <p className="text-xs text-slate-500">
                Heavy driving license classes, Mulkiya registrations & UAE critical gate pass credentials (CICPA / JAFZA / AD Ports)
              </p>
            </div>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Onboard Driver</span>
            </button>
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => (
              <div
                key={driver.id}
                className={`p-4 rounded-3xl border transition-colors space-y-3 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-black text-sm text-amber-700">
                      {driver.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">{driver.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{driver.phone}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                    driver.status === 'AVAILABLE'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : driver.status === 'ON_TRIP'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                {/* Details */}
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">License:</span>
                    <strong className="font-mono">{driver.licenseNumber} ({driver.licenseCategory})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validity:</span>
                    <strong className="text-emerald-600 font-mono">Until {driver.licenseExpiry}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Rig:</span>
                    <strong className="font-mono">{driver.assignedVehiclePlate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Payload:</span>
                    <strong>{driver.maxPayloadTons} Tons</strong>
                  </div>
                </div>

                {/* Gate Passes */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">APPROVED SITE GATE PASSES:</span>
                  <div className="flex flex-wrap gap-1">
                    {driver.gatePasses.map(pass => (
                      <span key={pass} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[9px] font-mono font-bold">
                        🛡️ {pass}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: MASTER DRIVER SCHEDULE MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <h3 className="font-black text-base">MASTER FLEET SCHEDULE MATRIX</h3>
            <p className="text-xs text-slate-500">
              Cross-driver availability, assigned trips, mandatory rest fatigue limits & scheduled vehicle maintenance blocks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map(block => (
              <div
                key={block.id}
                className={`p-4 rounded-3xl border transition-colors space-y-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                } ${block.type === 'TRIP_BOOKED' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">{block.driverName}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                    block.type === 'TRIP_BOOKED'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  }`}>
                    {block.typeName}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{block.title}</div>
                <div className="text-[10px] font-mono text-slate-400">Date: {block.date} • {block.timeWindow}</div>
                {block.notes && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                    {block.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboard Driver Modal */}
      <DriverOnboardingModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        onAddDriver={handleAddDriver}
        theme={theme}
      />

      {/* Demurrage Verification Certificate Modal */}
      <DemurrageCertificateModal
        isOpen={showDemurrageModal}
        onClose={() => setShowDemurrageModal(false)}
        tripCode={selectedTrip.id}
        customerName="Al Naboodah Contracting LLC"
        carrierName="Al Faris Heavy Transport LLC"
        theme={theme}
      />

      {/* WhatsApp Automated Dispatch Simulation Modal */}
      <WhatsAppDispatchModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        tripCode={selectedTrip.id}
        driverName={selectedTrip.driverName}
        driverPhone={selectedTrip.driverPhone}
        cargoDescription={selectedTrip.cargoDescription}
        originName={selectedTrip.originName}
        destinationName={selectedTrip.destinationName}
        trackingToken={selectedTrip.trackingToken}
        etaMinutes={selectedTrip.etaMinutes}
        theme={theme}
      />
    </div>
  );
}
