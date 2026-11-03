'use client';

import React, { useState } from 'react';
import { 
  MarketplaceVoucher, DriverProfile, DriverScheduleBlock, TripData 
} from '../data/dummyData';
import { 
  FileText, Truck, ShieldCheck, CheckCircle2, AlertTriangle, 
  MapPin, UserCheck, ArrowRight, Calendar, Sparkles, ExternalLink 
} from './Icons';

interface MarketplaceBridgeViewProps {
  vouchers: MarketplaceVoucher[];
  drivers: DriverProfile[];
  schedules: DriverScheduleBlock[];
  onDispatchVoucher: (voucher: MarketplaceVoucher, selectedDriver: DriverProfile) => void;
  theme?: 'light' | 'dark';
}

export default function MarketplaceBridgeView({
  vouchers,
  drivers,
  schedules,
  onDispatchVoucher,
  theme = 'light'
}: MarketplaceBridgeViewProps) {
  const isLight = theme === 'light';
  const [selectedVoucherForDispatch, setSelectedVoucherForDispatch] = useState<MarketplaceVoucher | null>(null);
  const [chosenDriverId, setChosenDriverId] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'PO' | 'RFQ'>('ALL');

  const filteredVouchers = vouchers.filter(v => {
    if (filterType === 'PO') return v.voucherType === 400;
    if (filterType === 'RFQ') return v.voucherType === 100;
    return true;
  });

  // Evaluate candidate drivers for selected voucher
  const getDriverEligibility = (driver: DriverProfile, voucher: MarketplaceVoucher) => {
    const reasons: string[] = [];
    let isEligible = true;

    // 1. Rig Payload Check
    if (driver.maxPayloadTons < voucher.cargoWeightTon) {
      isEligible = false;
      reasons.push(`Payload too low (${driver.maxPayloadTons}T < ${voucher.cargoWeightTon}T required)`);
    }

    // 2. Gate Pass Check
    if (voucher.requiredGatePass && voucher.requiredGatePass !== 'NONE') {
      if (!driver.gatePasses.includes(voucher.requiredGatePass)) {
        isEligible = false;
        reasons.push(`Missing mandatory security pass: ${voucher.requiredGatePass}`);
      }
    }

    // 3. Calendar Conflict Check
    const hasConflict = schedules.some(
      s => s.driverId === driver.id && s.date === voucher.scheduledDate
    );
    if (hasConflict) {
      isEligible = false;
      reasons.push(`Calendar conflict on scheduled date (${voucher.scheduledDate})`);
    }

    // 4. Status Check
    if (driver.status === 'BLOCKED_CALENDAR' || driver.status === 'EXPIRED_DOCS') {
      isEligible = false;
      reasons.push(`Driver status: ${driver.status.replace('_', ' ')}`);
    }

    return { isEligible, reasons };
  };

  const handleConfirmAssignment = () => {
    if (!selectedVoucherForDispatch || !chosenDriverId) return;
    const driver = drivers.find(d => d.id === chosenDriverId);
    if (!driver) return;

    onDispatchVoucher(selectedVoucherForDispatch, driver);
    setSelectedVoucherForDispatch(null);
    setChosenDriverId('');
  };

  return (
    <div className="space-y-4">
      {/* Overview Top Bar */}
      <div className={`p-4 rounded-2xl border transition-colors flex flex-wrap items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base">MARKETPLACE TRANSACTION / VOUCHER INGESTION</h3>
              <span className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                ASP.NET CORE CONTRACT (VOUCHER 100 & 400)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synced from Core API Transaction Engine • Auto-parse cargo remarks, geocode corridors & assign compliant drivers
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Orders ({vouchers.length})
          </button>
          <button
            onClick={() => setFilterType('PO')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'PO'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Purchase Orders (Voucher 400)
          </button>
          <button
            onClick={() => setFilterType('RFQ')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'RFQ'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Customer RFQs (Voucher 100)
          </button>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVouchers.map(voucher => {
          const isAssigned = !!voucher.assignedDriverId;
          const assignedDriver = drivers.find(d => d.id === voucher.assignedDriverId);

          return (
            <div
              key={voucher.headerId}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                isLight 
                  ? 'bg-white border-slate-200/90 hover:shadow-md' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              } ${isAssigned ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500'}`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm font-mono tracking-tight text-slate-900 dark:text-white">
                        {voucher.voucherNo}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                        voucher.voucherType === 400 
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        VOUCHER {voucher.voucherType} · {voucher.voucherTypeName}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      {voucher.customerName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-amber-400 font-mono">
                      AED {voucher.netAED.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      VAT Inc. (5%)
                    </div>
                  </div>
                </div>

                {/* Cargo & Equipment Spec */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{voucher.cargoDescription}</span>
                    <span className="font-mono font-bold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                      {voucher.cargoWeightTon} Tons
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Rig Required: <strong>{voucher.equipmentType}</strong></span>
                    <span>•</span>
                    <span>Capacity: <strong>{voucher.capacityRequired}</strong></span>
                  </div>
                </div>

                {/* Corridor / Route */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">{voucher.originText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{voucher.destinationText}</span>
                  </div>
                </div>

                {/* Badges: Gate Pass & Scheduled Date */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Pickup: {voucher.scheduledDate}
                  </span>

                  {voucher.requiredGatePass && voucher.requiredGatePass !== 'NONE' && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold font-mono text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Mandatory: {voucher.requiredGatePass} Pass
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment Status & Action */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2">
                {isAssigned ? (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900 dark:text-white">
                        Dispatched to {assignedDriver?.fullName || 'Driver'}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-mono font-semibold">
                        Trip Code: {voucher.convertedTripId} · Live Telematics Linked
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Ready for Driver Assignment
                  </div>
                )}

                {!isAssigned && (
                  <button
                    onClick={() => {
                      setSelectedVoucherForDispatch(voucher);
                      setChosenDriverId('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <span>Match & Dispatch Driver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Assignment & Booking Modal */}
      {selectedVoucherForDispatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-xl w-full rounded-3xl p-6 shadow-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                  DISPATCH FOR {selectedVoucherForDispatch.voucherNo}
                </div>
                <h3 className="font-black text-base">Select & Book Eligible Driver</h3>
              </div>
              <button
                onClick={() => setSelectedVoucherForDispatch(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Cargo Manifest Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                {selectedVoucherForDispatch.cargoDescription}
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                <span>Weight: <strong>{selectedVoucherForDispatch.cargoWeightTon} Tons</strong></span>
                <span>•</span>
                <span>Pickup: <strong>{selectedVoucherForDispatch.scheduledDate}</strong></span>
                {selectedVoucherForDispatch.requiredGatePass && selectedVoucherForDispatch.requiredGatePass !== 'NONE' && (
                  <span className="text-rose-600 font-bold">• Pass Required: {selectedVoucherForDispatch.requiredGatePass}</span>
                )}
              </div>
            </div>

            {/* Driver Matchmaking List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Ranked Fleet Candidates (Payload + Gate Pass + Calendar Availability)
              </div>

              {drivers.map(driver => {
                const { isEligible, reasons } = getDriverEligibility(driver, selectedVoucherForDispatch);
                const isSelected = chosenDriverId === driver.id;

                return (
                  <div
                    key={driver.id}
                    onClick={() => isEligible && setChosenDriverId(driver.id)}
                    className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between gap-3 ${
                      isEligible
                        ? isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500 cursor-pointer'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 cursor-pointer'
                        : 'bg-slate-100/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-900 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white">{driver.fullName}</span>
                        <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                          {driver.assignedVehiclePlate}
                        </span>
                        {isEligible ? (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/30 px-1.5 rounded">
                            Match 100%
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-500/10 border border-rose-500/30 px-1.5 rounded">
                            Ineligible
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {driver.vehicleType} • Payload: {driver.maxPayloadTons}T
                      </div>

                      {/* Reasons if ineligible */}
                      {!isEligible && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{reasons.join(' • ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <input 
                        type="radio" 
                        name="driverCandidate" 
                        checked={isSelected}
                        disabled={!isEligible}
                        onChange={() => setChosenDriverId(driver.id)}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy Enforcement Notice */}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Assigning will auto-lock the driver's calendar and create a live telematics token for the customer.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVoucherForDispatch(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!chosenDriverId}
                onClick={handleConfirmAssignment}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Confirm Assignment & Lock Schedule</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
