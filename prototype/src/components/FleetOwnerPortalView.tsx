'use client';

import React, { useState } from 'react';
import { 
  DUMMY_FLEET_OWNERS, 
  DUMMY_BACKHAUL_LEADS, 
  DUMMY_TOLL_EVENTS,
  FleetOwner,
  FleetVehicle,
  BackhaulLead,
  TollGantryEvent
} from '../data/dummyData';
import { 
  Truck, Radio, ShieldCheck, CheckCircle2, AlertTriangle, 
  Search, Plus, FileText, DollarSign, Clock, Users, Building2,
  Calendar, ChevronRight, Zap, ExternalLink, ArrowRight, Shield, Printer
} from './Icons';
import DemurrageCertificateModal from './DemurrageCertificateModal';

interface FleetOwnerPortalViewProps {
  theme: 'light' | 'dark';
  onNavigateToTrip?: (tripId: string) => void;
}

type FleetSubTab = 'ROSTER' | 'ORDERS' | 'BACKHAUL' | 'FINANCIALS';

export default function FleetOwnerPortalView({ theme, onNavigateToTrip }: FleetOwnerPortalViewProps) {
  const isLight = theme === 'light';
  const [fleetOwner, setFleetOwner] = useState<FleetOwner>(DUMMY_FLEET_OWNERS[0]);
  const [backhauls, setBackhauls] = useState<BackhaulLead[]>(DUMMY_BACKHAUL_LEADS);
  const [activeSubTab, setActiveSubTab] = useState<FleetSubTab>('ROSTER');
  const [rosterFilter, setRosterFilter] = useState<'ALL' | 'ON_TRIP' | 'AVAILABLE' | 'MAINTENANCE'>('ALL');
  
  // Delegation Modal State
  const [delegatingTrip, setDelegatingTrip] = useState<any | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('Faisal Mahmood');
  const [selectedPlate, setSelectedPlate] = useState<string>('AUH-T-39182');
  const [delegationSuccess, setDelegationSuccess] = useState<string | null>(null);

  // New Rig Modal State
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [newTruckPlate, setNewTruckPlate] = useState('');
  const [newTruckType, setNewTruckType] = useState('Heavy Flatbed 40ft (Triple-Axle)');
  const [newTruckPayload, setNewTruckPayload] = useState('45');
  const [newTruckGatePasses, setNewTruckGatePasses] = useState<string[]>(['CICPA', 'JAFZA']);

  // Backhaul Claim State
  const [claimedBackhauls, setClaimedBackhauls] = useState<string[]>([]);
  const [showDemurrageModal, setShowDemurrageModal] = useState(false);

  // Filtered vehicles
  const filteredVehicles = fleetOwner.vehicles.filter(v => {
    if (rosterFilter === 'ALL') return true;
    return v.status === rosterFilter;
  });

  const handleConfirmDelegation = () => {
    if (!delegatingTrip) return;

    setFleetOwner(prev => ({
      ...prev,
      upcomingAssignedTrips: prev.upcomingAssignedTrips.map(trip => {
        if (trip.tripId === delegatingTrip.tripId) {
          return {
            ...trip,
            assignedDriver: selectedDriver,
            assignedPlate: selectedPlate,
            status: 'DISPATCHED'
          };
        }
        return trip;
      }),
      vehicles: prev.vehicles.map(veh => {
        if (veh.plate === selectedPlate) {
          return {
            ...veh,
            status: 'ON_TRIP',
            assignedDriverName: selectedDriver,
            activeTripCode: delegatingTrip.tripId
          };
        }
        return veh;
      }),
      activeOnTrip: prev.activeOnTrip + 1,
      idleInYard: Math.max(0, prev.idleInYard - 1)
    }));

    setDelegationSuccess(`Successfully assigned ${selectedDriver} (${selectedPlate}) to Purchase Order ${delegatingTrip.voucherNo}. Push notification dispatched to driver smartphone.`);
    setTimeout(() => {
      setDelegatingTrip(null);
      setDelegationSuccess(null);
    }, 2500);
  };

  const handleClaimBackhaul = (leadId: string) => {
    setClaimedBackhauls(prev => [...prev, leadId]);
    const lead = backhauls.find(b => b.id === leadId);
    if (lead) {
      alert(`Backhaul Lead ${lead.id} reserved for your fleet!\nRoute: ${lead.returnPickupCity} → ${lead.returnDropCity}\nOffered Rate: AED ${lead.offeredRateAED.toLocaleString()}\nAdded to your marketplace queue.`);
    }
  };

  const handleAddNewTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruckPlate.trim()) return;

    const newVehicle: FleetVehicle = {
      plate: newTruckPlate.toUpperCase(),
      type: newTruckType,
      payloadTons: parseFloat(newTruckPayload) || 40,
      status: 'AVAILABLE',
      assignedDriverName: 'Unassigned',
      gatePasses: newTruckGatePasses
    };

    setFleetOwner(prev => ({
      ...prev,
      totalTrucks: prev.totalTrucks + 1,
      idleInYard: prev.idleInYard + 1,
      vehicles: [newVehicle, ...prev.vehicles]
    }));

    setNewTruckPlate('');
    setIsAddTruckModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP ENTERPRISE CARRIER BADGE & KPI METRICS */}
      {/* ======================================================== */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-200' 
          : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] font-mono uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                COMMERCIAL CARRIER TIER 1
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${
                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                KASPER VENDOR #{fleetOwner.marketplaceVendorId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[11px] font-mono font-bold">
                ✓ FTA VAT VERIFIED
              </span>
            </div>

            <h1 className={`text-2xl lg:text-3xl font-black tracking-tight ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}>
              {fleetOwner.companyName}
            </h1>

            <div className={`flex flex-wrap items-center gap-4 text-xs font-mono ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span>TRN: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{fleetOwner.trnNumber}</strong></span>
              <span>•</span>
              <span>License: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{fleetOwner.tradeLicenseNo}</strong> (Exp: {fleetOwner.tradeLicenseExpiry})</span>
              <span>•</span>
              <span>Payout IBAN: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{fleetOwner.bankName} - {fleetOwner.bankIBAN.slice(0, 10)}...</strong></span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddTruckModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Rig</span>
            </button>
          </div>
        </div>

        {/* Financial & Fleet Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
          {/* Card 1: Total Rigs */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-[11px] font-mono text-slate-500 font-medium">TOTAL FLEET RIGS</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {fleetOwner.totalTrucks}
              </span>
              <span className="text-[11px] font-bold text-amber-600">Rigs</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <span className="text-emerald-500 font-bold">{fleetOwner.activeOnTrip} active</span> • {fleetOwner.idleInYard} idle
            </div>
          </div>

          {/* Card 2: Gross Freight Earned */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-[11px] font-mono text-slate-500 font-medium">GROSS BILLED</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-mono font-bold text-amber-600">AED</span>
              <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {fleetOwner.totalGrossRevenueAED.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-1 font-mono font-semibold">
              +14.2% vs last month
            </div>
          </div>

          {/* Card 3: Pending Payout */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-[11px] font-mono text-slate-500 font-medium">PENDING PAYOUT</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-mono font-bold text-amber-500">AED</span>
              <span className="text-2xl font-black font-mono text-amber-500">
                {fleetOwner.pendingPayoutAED.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Next cycle: Thursday
            </div>
          </div>

          {/* Card 4: Disbursed Funds */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="text-[11px] font-mono text-slate-500 font-medium">DISBURSED TO IBAN</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-mono font-bold text-emerald-600">AED</span>
              <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {fleetOwner.disbursedAED.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-1 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Auto-reconciled
            </div>
          </div>

          {/* Card 5: Deadhead Saved (TruKKer Moat) */}
          <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-4 lg:col-span-1 ${
            isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/20'
          }`}>
            <div className="text-[11px] font-mono text-amber-700 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              BACKHAUL SAVINGS
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-amber-600">375</span>
              <span className="text-xs font-bold font-mono text-slate-600">km deadhead</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-1 font-mono">
              Saved AED 4,250 in empty fuel
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ROSTER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ROSTER'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet Roster & Telematics ({fleetOwner.vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ORDERS'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assigned POs & Delegation ({fleetOwner.upcomingAssignedTrips.length})</span>
          {fleetOwner.upcomingAssignedTrips.some(t => t.status === 'PENDING_DELEGATION') && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('BACKHAUL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'BACKHAUL'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Corridor Backhaul Leads ({backhauls.length})</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-white font-mono">
            DEADHEAD KILLER
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('FINANCIALS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'FINANCIALS'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Ledger, Tolls & Demurrage</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TAB CONTENT */}
      {/* ======================================================== */}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 1: FLEET ROSTER */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'ROSTER' && (
        <div className="space-y-4">
          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                FILTER STATUS:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs">
                {(['ALL', 'ON_TRIP', 'AVAILABLE', 'MAINTENANCE'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRosterFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold font-mono transition-all ${
                      rosterFilter === f
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'ALL RIGS' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredVehicles.length} of {fleetOwner.vehicles.length} heavy transport assets
            </span>
          </div>

          {/* Roster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map(veh => (
              <div
                key={veh.plate}
                className={`p-5 rounded-2xl border transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 hover:border-amber-400 shadow-sm' 
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 font-mono font-black text-sm">
                        {veh.plate}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        veh.status === 'ON_TRIP' 
                          ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                          : veh.status === 'AVAILABLE'
                          ? 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
                          : 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                      }`}>
                        {veh.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {veh.type}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-500 block">RATED PAYLOAD</span>
                    <span className={`text-base font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {veh.payloadTons}T
                    </span>
                  </div>
                </div>

                {/* Gate Passes Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">GATE PERMITS:</span>
                  {veh.gatePasses.map(pass => (
                    <span 
                      key={pass}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      ✓ {pass}
                    </span>
                  ))}
                </div>

                {/* Assigned Driver and Active Trip info */}
                <div className={`mt-4 pt-3 border-t text-xs flex items-center justify-between ${
                  isLight ? 'border-slate-100 text-slate-600' : 'border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{veh.assignedDriverName || 'No Driver'}</span>
                  </div>

                  {veh.activeTripCode ? (
                    <button
                      onClick={() => onNavigateToTrip && onNavigateToTrip(veh.activeTripCode!)}
                      className="text-amber-600 font-bold font-mono hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>{veh.activeTripCode}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-mono">Idle in Yard</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 2: MARKETPLACE ASSIGNED POS & DELEGATION */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Awarded Purchase Orders (Voucher 400 Ingestion)
              </h3>
              <p className="text-xs text-slate-500">
                Direct integration with Kasper Marketplace ASP.NET Core Transaction Engine. Delegate company rigs & drivers to execute awarded customer freight.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {fleetOwner.upcomingAssignedTrips.map(order => (
              <div
                key={order.tripId}
                className={`p-5 rounded-2xl border transition-all ${
                  order.status === 'PENDING_DELEGATION'
                    ? isLight ? 'bg-amber-500/5 border-amber-300 shadow-md' : 'bg-amber-500/10 border-amber-500/40'
                    : isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-700 font-mono font-bold text-xs">
                        {order.voucherNo}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        TRIP: {order.tripId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        order.status === 'PENDING_DELEGATION'
                          ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30 animate-pulse'
                          : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                      }`}>
                        {order.status === 'PENDING_DELEGATION' ? '⚡ ACTION NEEDED: DELEGATE RIG' : 'DISPATCHED & ASSIGNED'}
                      </span>
                    </div>

                    <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {order.corridor}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                      <span>Customer: <strong className={isLight ? 'text-slate-800' : 'text-slate-300'}>{order.customer}</strong></span>
                      <span>•</span>
                      <span>Schedule: {order.scheduledDate}</span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-500 block">NET FREIGHT REVENUE</span>
                      <span className={`text-xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        AED {order.netAmountAED.toLocaleString()}
                      </span>
                    </div>

                    {order.status === 'PENDING_DELEGATION' ? (
                      <button
                        onClick={() => setDelegatingTrip(order)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Delegate Driver & Rig</span>
                      </button>
                    ) : (
                      <div className={`p-3 rounded-xl border text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <div className="text-slate-500 text-[10px]">ASSIGNED TO:</div>
                        <div className="font-bold text-amber-600">{order.assignedDriver}</div>
                        <div className="text-slate-400 text-[11px]">{order.assignedPlate}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 3: CORRIDOR BACKHAUL LEADS (TRUKKER MOAT) */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'BACKHAUL' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black">
                  Deadhead Elimination Engine (Corridor Return Load Matchmaker)
                </h4>
                <p className="text-xs mt-1 leading-relaxed text-emerald-800 dark:text-emerald-300">
                  When your rigs unload in Ruwais, Barakah, or Abu Dhabi Saadiyat, our marketplace automatically detects empty return legs. Claiming these open customer RFQs recovers diesel expenses and delivers 100% margin on return legs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backhauls.map(lead => {
              const isClaimed = claimedBackhauls.includes(lead.id);

              return (
                <div
                  key={lead.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isClaimed
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : isLight ? 'bg-white border-slate-200 hover:border-amber-400 shadow-sm' : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[11px] font-mono font-bold">
                          DEADHEAD SAVINGS: {lead.deadheadKmSaved} KM
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] font-mono font-bold">
                          {lead.urgency} DEMAND
                        </span>
                      </div>

                      <h4 className={`text-base font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {lead.returnPickupCity} ➔ {lead.returnDropCity}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-500 block">OFFERED RATE</span>
                      <span className="text-xl font-black font-mono text-emerald-600">
                        AED {lead.offeredRateAED.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Cargo: <strong className={isLight ? 'text-slate-700' : 'text-slate-300'}>{lead.cargoDescription}</strong> ({lead.cargoWeightTon} Tons)
                  </p>

                  <div className={`mt-3 pt-3 border-t text-xs flex items-center justify-between ${
                    isLight ? 'border-slate-100' : 'border-slate-800'
                  }`}>
                    <span className="font-mono text-[11px] text-slate-400">
                      Linked: {lead.linkedMarketplaceRfqNo}
                    </span>

                    {isClaimed ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        RESERVED FOR FLEET
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimBackhaul(lead.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-1 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Claim Return Load</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* SUB-TAB 4: FINANCIALS, TOLLS & DEMURRAGE */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'FINANCIALS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs font-mono text-slate-500">AUTO-REFUNDED TOLLS (SALIK / DARB)</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-mono text-amber-500 font-bold">AED</span>
                <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {DUMMY_TOLL_EVENTS.reduce((sum, t) => sum + t.tollRateAED, 0).toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                3 Gantries Geofenced & Reimbursed
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <div className="text-xs font-mono text-slate-500">TERMINAL DEMURRAGE AUDITED</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-mono text-amber-500 font-bold">AED</span>
                  <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    350.00
                  </span>
                </div>
                <div className="text-[11px] text-amber-600 font-mono mt-1">
                  3.5 Hours Port Gate Hold @ AED 100/hr
                </div>
              </div>
              <button
                onClick={() => setShowDemurrageModal(true)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Demurrage Proof Certificate</span>
              </button>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-xs font-mono text-slate-500">NEXT PAYOUT REMITTANCE</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-mono text-emerald-600 font-bold">AED</span>
                <span className={`text-2xl font-black font-mono text-emerald-600`}>
                  {fleetOwner.pendingPayoutAED.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Direct to {fleetOwner.bankName} (IBAN: ...0492)
              </div>
            </div>
          </div>

          {/* Toll Gantries Detailed Audit Log */}
          <div className={`p-5 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Automated Toll Gantry Geofence Reconciliation Log</span>
              </h4>
              <span className="text-xs font-mono text-slate-500">Zero Driver Expense Vouchers Needed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b text-[11px] ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                  }`}>
                    <th className="pb-2">GANTRY EVENT</th>
                    <th className="pb-2">TOLL SYSTEM</th>
                    <th className="pb-2">TRIP CODE</th>
                    <th className="pb-2">DETECTED TIME</th>
                    <th className="pb-2">RATE</th>
                    <th className="pb-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {DUMMY_TOLL_EVENTS.map(toll => (
                    <tr key={toll.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold">{toll.gantryName}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          toll.system === 'SALIK' 
                            ? 'bg-rose-500/15 text-rose-700' 
                            : 'bg-blue-500/15 text-blue-700'
                        }`}>
                          {toll.system}
                        </span>
                      </td>
                      <td className="py-2.5 text-amber-600">{toll.tripCode}</td>
                      <td className="py-2.5 text-slate-500">{toll.detectedAt}</td>
                      <td className="py-2.5 font-bold">AED {toll.tollRateAED.toFixed(2)}</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[10px] font-bold">
                          ✓ AUTO-REIMBURSED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL: DELEGATE DRIVER & RIG */}
      {/* ======================================================== */}
      {delegatingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black">Delegate Purchase Order</h3>
              </div>
              <button 
                onClick={() => setDelegatingTrip(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {delegationSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                <p className="text-xs font-bold font-mono">{delegationSuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="text-slate-500">CUSTOMER PURCHASE ORDER:</div>
                  <div className="font-bold text-amber-600">{delegatingTrip.voucherNo} · {delegatingTrip.customer}</div>
                  <div className="text-slate-400">{delegatingTrip.corridor}</div>
                  <div className="font-bold">Freight Fee: AED {delegatingTrip.netAmountAED.toLocaleString()}</div>
                </div>

                {/* Driver Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-500">
                    SELECT AVAILABLE COMPANY DRIVER:
                  </label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold font-mono focus:outline-none focus:border-amber-500 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <option value="Faisal Mahmood">Faisal Mahmood (CICPA + JAFZA + AD Ports Qualified)</option>
                    <option value="Sajid Ali">Sajid Ali (Heavy Boom Truck Certified)</option>
                  </select>
                </div>

                {/* Truck Rig Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-500">
                    ASSIGN FLEET VEHICLE (IDLE IN YARD):
                  </label>
                  <select
                    value={selectedPlate}
                    onChange={(e) => setSelectedPlate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold font-mono focus:outline-none focus:border-amber-500 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {fleetOwner.vehicles
                      .filter(v => v.status === 'AVAILABLE')
                      .map(v => (
                        <option key={v.plate} value={v.plate}>
                          {v.plate} - {v.type} ({v.payloadTons}T Payload)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-mono">
                  ⚡ Driver will receive automated smartphone push dispatch with pickup GPS coordinates and consignment manifest.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setDelegatingTrip(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelegation}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                  >
                    Confirm Dispatch Delegation ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: REGISTER NEW RIG (MULKIYA) */}
      {/* ======================================================== */}
      {isAddTruckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black">Register Commercial Rig (Mulkiya)</h3>
              </div>
              <button 
                onClick={() => setIsAddTruckModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTruck} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-500">
                  TRAFFIC PLATE NUMBER:
                </label>
                <input
                  type="text"
                  placeholder="e.g. DXB-T-90218"
                  value={newTruckPlate}
                  onChange={(e) => setNewTruckPlate(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-amber-500 uppercase ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-500">
                  RIG / TRAILER CONFIGURATION:
                </label>
                <select
                  value={newTruckType}
                  onChange={(e) => setNewTruckType(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold font-mono focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <option value="Heavy Flatbed 40ft (Triple-Axle)">Heavy Flatbed 40ft (Triple-Axle)</option>
                  <option value="Lowbed 60-Ton (Hydraulic Gooseneck)">Lowbed 60-Ton (Hydraulic Gooseneck)</option>
                  <option value="Container Skeletal Chassis 40ft">Container Skeletal Chassis 40ft</option>
                  <option value="Boom Truck 10-Ton with Crane">Boom Truck 10-Ton with Crane</option>
                  <option value="Heavy Pipe-Carrier Flatbed">Heavy Pipe-Carrier Flatbed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-500">
                  MAX CERTIFIED PAYLOAD (TONS):
                </label>
                <input
                  type="number"
                  value={newTruckPayload}
                  onChange={(e) => setNewTruckPayload(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-500">
                  ACTIVE TERMINAL GATE PASSES:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CICPA', 'JAFZA', 'AD_PORTS'].map(pass => {
                    const isChecked = newTruckGatePasses.includes(pass);
                    return (
                      <button
                        type="button"
                        key={pass}
                        onClick={() => {
                          if (isChecked) {
                            setNewTruckGatePasses(prev => prev.filter(p => p !== pass));
                          } else {
                            setNewTruckGatePasses(prev => [...prev, pass]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          isChecked 
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isChecked ? `✓ ${pass}` : `+ ${pass}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTruckModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  Save Commercial Rig ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demurrage Verification Certificate Modal */}
      <DemurrageCertificateModal
        isOpen={showDemurrageModal}
        onClose={() => setShowDemurrageModal(false)}
        tripCode="KSP-EQ-101"
        poNumber="PO-2026-0042"
        customerName="Al Naboodah Contracting LLC"
        carrierName={fleetOwner.companyName}
        waitingHours={3.5}
        hourlyRateAED={100.00}
        totalDemurrageAED={350.00}
        theme={theme}
      />
    </div>
  );
}
