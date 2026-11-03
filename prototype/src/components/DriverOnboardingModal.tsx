'use client';

import React, { useState } from 'react';
import { DriverProfile } from '../data/dummyData';
import { 
  ShieldCheck, CheckCircle2, UserCheck, 
  MapPin, AlertTriangle, FileText, Upload, Sparkles 
} from './Icons';

interface DriverOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driver: DriverProfile) => void;
  theme?: 'light' | 'dark';
}

export default function DriverOnboardingModal({
  isOpen,
  onClose,
  onAddDriver,
  theme = 'light'
}: DriverOnboardingModalProps) {
  const isLight = theme === 'light';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+971 50 ');
  const [preferredLanguage, setPreferredLanguage] = useState<'EN' | 'AR' | 'UR'>('EN');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<DriverProfile['licenseCategory']>('Articulated Trailer');
  const [licenseExpiry, setLicenseExpiry] = useState('2027-12-31');
  const [licenseIssuingAuthority, setLicenseIssuingAuthority] = useState('RTA Dubai');
  const [emiratesId, setEmiratesId] = useState('784-1990-');
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState('DXB-T-');
  const [vehicleType, setVehicleType] = useState('Heavy Flatbed 40ft (Triple-Axle)');
  const [maxPayloadTons, setMaxPayloadTons] = useState(40);
  const [carrierCompany, setCarrierCompany] = useState('Kasper Direct Fleet');
  const [gatePasses, setGatePasses] = useState<('CICPA' | 'JAFZA' | 'AD_PORTS')[]>(['JAFZA']);
  
  // Document upload simulation states
  const [licenseUploaded, setLicenseUploaded] = useState(true);
  const [emiratesIdUploaded, setEmiratesIdUploaded] = useState(true);
  const [mulkiyaUploaded, setMulkiyaUploaded] = useState(true);

  if (!isOpen) return null;

  const toggleGatePass = (pass: 'CICPA' | 'JAFZA' | 'AD_PORTS') => {
    setGatePasses(prev => 
      prev.includes(pass) ? prev.filter(p => p !== pass) : [...prev, pass]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !licenseNumber || !assignedVehiclePlate) {
      alert('Please fill out all required driver details.');
      return;
    }

    const newDriver: DriverProfile = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      fullName,
      phone,
      preferredLanguage,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      licenseIssuingAuthority,
      emiratesId,
      emiratesIdExpiry: '2027-10-30',
      assignedVehiclePlate,
      vehicleType,
      maxPayloadTons,
      carrierCompany,
      gatePasses,
      status: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      totalTripsCompleted: 0
    };

    onAddDriver(newDriver);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`max-w-2xl w-full rounded-3xl p-6 shadow-2xl border space-y-5 my-8 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg">Onboard New Transporter / Driver</h3>
              <p className="text-xs text-slate-500 font-mono">KYC Verification, Heavy License & UAE Gate Pass Registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Personal & Transporter */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-[11px] font-mono tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>1. PERSONAL IDENTITY & TRANSPORTER AFFILIATION</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Full Legal Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tariq Mehmood"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">UAE Mobile (+971) *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Preferred UI Language</label>
                <select
                  value={preferredLanguage}
                  onChange={e => setPreferredLanguage(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="EN">English (EN)</option>
                  <option value="AR">العربية (AR)</option>
                  <option value="UR">اردو (UR)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Emirates ID Number *</label>
                <input 
                  type="text" 
                  value={emiratesId}
                  onChange={e => setEmiratesId(e.target.value)}
                  placeholder="784-1988-1234567-1"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Carrier / Transporter Vendor</label>
                <input 
                  type="text" 
                  value={carrierCompany}
                  onChange={e => setCarrierCompany(e.target.value)}
                  placeholder="Kasper Direct Fleet or Subcontractor LLC"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Driving License & Regulatory Compliance */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-[11px] font-mono tracking-wider text-slate-500 flex items-center justify-between">
              <span>2. HEAVY DRIVING LICENSE & REGULATORY AUTHORIZATION</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Automated Expiry Watcher
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">License Number *</label>
                <input 
                  type="text" 
                  placeholder="DXB-HV-99410"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">License Category *</label>
                <select
                  value={licenseCategory}
                  onChange={e => setLicenseCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Articulated Trailer">Articulated Trailer (Heavy Haul)</option>
                  <option value="Heavy Truck">Heavy Truck (&gt;2.5 Ton)</option>
                  <option value="Heavy Equipment Operator">Heavy Equipment / Lowbed Operator</option>
                  <option value="Light Vehicle">Light Vehicle (Pickups / Escort)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Issuing Authority</label>
                <select
                  value={licenseIssuingAuthority}
                  onChange={e => setLicenseIssuingAuthority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="RTA Dubai">RTA Dubai</option>
                  <option value="ITC Abu Dhabi">ITC Abu Dhabi</option>
                  <option value="Sharjah RTA">Sharjah RTA</option>
                  <option value="Ras Al Khaimah Transport">RAK Transport Authority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">License Expiry Date *</label>
                <input 
                  type="date" 
                  value={licenseExpiry}
                  onChange={e => setLicenseExpiry(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* UAE Gate Passes & Security Clearances */}
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Approved Security Gate Passes</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleGatePass('CICPA')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      gatePasses.includes('CICPA')
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    🛡️ CICPA (Abu Dhabi Oil/Ruwais)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGatePass('JAFZA')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      gatePasses.includes('JAFZA')
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    ⚓ JAFZA (Jebel Ali Port)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGatePass('AD_PORTS')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      gatePasses.includes('AD_PORTS')
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    🚢 AD Ports (Khalifa Port)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle Specs & Mulkiya */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="font-bold text-[11px] font-mono tracking-wider text-slate-500">
              3. ASSIGNED TRUCK & MULKIYA REGISTRATION
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Vehicle Plate Code & No *</label>
                <input 
                  type="text" 
                  value={assignedVehiclePlate}
                  onChange={e => setAssignedVehiclePlate(e.target.value)}
                  placeholder="DXB-T-49102"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Vehicle Rig Type *</label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Heavy Flatbed 40ft (Triple-Axle)">Heavy Flatbed 40ft (Triple-Axle)</option>
                  <option value="Lowbed 60-Ton (Hydraulic Gooseneck)">Lowbed 60-Ton (Hydraulic Gooseneck)</option>
                  <option value="Lowbed 80-Ton Heavy Haul">Lowbed 80-Ton Heavy Haul</option>
                  <option value="Boom Truck 10-Ton">Boom Truck 10-Ton with Crane</option>
                  <option value="Container Skeletal Chassis 40ft">Container Skeletal Chassis 40ft</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Payload Capacity (Tons)</label>
                <input 
                  type="number" 
                  value={maxPayloadTons}
                  onChange={e => setMaxPayloadTons(+e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Simulated Verified Document Upload Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[10px]">License Scan</div>
                  <div className="text-[9px] text-slate-400 font-mono">Front & Back OK</div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[10px]">Emirates ID</div>
                  <div className="text-[9px] text-slate-400 font-mono">KYC Authenticated</div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[10px]">Mulkiya Card</div>
                  <div className="text-[9px] text-slate-400 font-mono">RTA Validated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Telematics Notice */}
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Trip-Gated Privacy Agreement:</strong> Once onboarded, driver location tracking will strictly activate when the driver taps <em>"START TRIP"</em> on their phone, and will completely shut off when the ePOD is signed.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Onboard & Activate Driver</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
