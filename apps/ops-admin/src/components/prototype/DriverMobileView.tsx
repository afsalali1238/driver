'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TripData } from '../../data/dummyData';
import { 
  Truck, Navigation, ShieldCheck, Camera, CheckSquare, 
  MapPin, Phone, WifiOff, Wifi, Globe, PenTool, CheckCircle2,
  RefreshCw, FileText, ArrowRight, Battery, Signal
} from './Icons';

interface DriverMobileViewProps {
  trip: TripData;
  onTripStatusChange?: (newStatus: TripData['status']) => void;
  theme?: 'light' | 'dark';
}

type Language = 'EN' | 'AR' | 'UR';

export default function DriverMobileView({ 
  trip, 
  onTripStatusChange,
  theme = 'light' 
}: DriverMobileViewProps) {
  const isLight = theme === 'light';
  const [lang, setLang] = useState<Language>('EN');
  const [activeTab, setActiveTab] = useState<'TRIP' | 'INSPECT' | 'EPOD'>('TRIP');
  const [isOffline, setIsOffline] = useState(false);
  const [bufferedBreadcrumbs, setBufferedBreadcrumbs] = useState(0);
  const [tripState, setTripState] = useState<TripData['status']>(trip.status);
  
  // Signature pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [receiverName, setReceiverName] = useState('Eng. Mustafa Al-Hashimi');
  const [receiverRole, setReceiverRole] = useState('Senior Site Logistics Engineer');
  const [epodSubmitted, setEpodSubmitted] = useState(false);

  // Pre-trip inspection checkboxes
  const [inspectionChecks, setInspectionChecks] = useState({
    chainsTension: true,
    tirePressure: true,
    brakeAirLines: true,
    warningLights: true,
    oversizeBanner: true
  });
  const [photosCount, setPhotosCount] = useState(2);

  // Offline buffer simulation timer
  useEffect(() => {
    let interval: any;
    if (isOffline && tripState === 'IN_TRANSIT') {
      interval = setInterval(() => {
        setBufferedBreadcrumbs(prev => prev + 1);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOffline, tripState]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Translations
  const t = {
    EN: {
      appName: 'KASPER DRIVER',
      activeTrip: 'ACTIVE TRIP',
      cargo: 'CARGO MANIFEST',
      pickup: 'PICKUP SITE',
      drop: 'DELIVERY SITE',
      startPickup: 'START TO PICKUP',
      arrivedPickup: 'ARRIVED AT PICKUP',
      startTransit: 'START TRANSIT TO SITE',
      arrivedSite: 'ARRIVED AT SITE',
      completeEpod: 'SIGN & DELIVER (ePOD)',
      inspection: 'PRE-TRIP CHECK',
      epodTitle: 'ELECTRONIC POD',
      receiver: 'RECEIVER NAME',
      designation: 'DESIGNATION',
      signHere: 'TOUCH OR MOUSE SIGNATURE BELOW',
      clear: 'CLEAR',
      submitPOD: 'SUBMIT DELIVERY PROOF',
      tripGatedNotice: 'Privacy Active: GPS only streamed while trip is in progress',
      offlineActive: 'OFFLINE MODE: Buffered in SQLite',
      onlineActive: 'ONLINE: Connected to Kasper Ingestion API',
    },
    AR: {
      appName: 'كاسبر للسائقين',
      activeTrip: 'الرحلة النشطة',
      cargo: 'بيانات الحمولة والمعدات',
      pickup: 'موقع الاستلام والتحميل',
      drop: 'موقع التسليم في المشروع',
      startPickup: 'بدء التحرك للاستلام',
      arrivedPickup: 'تم الوصول لموقع الاستلام',
      startTransit: 'بدء التحرك لموقع المشروع',
      arrivedSite: 'تم الوصول للمشروع',
      completeEpod: 'توقيع إثبات التسليم الإلكتروني',
      inspection: 'الفحص الميداني',
      epodTitle: 'إثبات التسليم الرقمي',
      receiver: 'اسم المستلم المعتمد',
      designation: 'الصفة الوظيفية',
      signHere: 'وقع هنا باللمس أو الفأرة',
      clear: 'مسح التوقيع',
      submitPOD: 'اعتماد وتسليم البضاعة',
      tripGatedNotice: 'الخصوصية مفعلة: يتم تتبع الموقع فقط خلال سير الرحلة',
      offlineActive: 'وضع عدم الاتصال: يتم الحفظ محلياً في SQLite',
      onlineActive: 'متصل: جاهز لإرسال البيانات',
    },
    UR: {
      appName: 'کیسپر ڈرائیور',
      activeTrip: 'موجودہ ٹرپ',
      cargo: 'سامان کی تفصیل',
      pickup: 'پک اپ لوکیشن',
      drop: 'ڈلیوری سائیٹ',
      startPickup: 'پک اپ کے لیے روانہ ہوں',
      arrivedPickup: 'پک اپ پر پہنچ گئے',
      startTransit: 'سائیٹ کے لیے روانہ ہوں',
      arrivedSite: 'سائیٹ پر پہنچ گئے',
      completeEpod: 'ڈیجیٹل سائن اور مکمل کریں',
      inspection: 'گاڑی کا معائنہ',
      epodTitle: 'ڈیجیٹل رسید (ePOD)',
      receiver: 'وصول کنندہ کا نام',
      designation: 'عہدہ',
      signHere: 'یہاں سائن کریں',
      clear: 'دوبارہ سائن کریں',
      submitPOD: 'ڈلیوری مکمل کریں',
      tripGatedNotice: 'پرائیویسی فعال: لوکیشن صرف فعال سفر کے دوران ریکارڈ ہوگی',
      offlineActive: 'آف لائن موڈ: لوکل اسٹوریج میں محفوظ ہو رہا ہے',
      onlineActive: 'آن لائن: سسٹم سے منسلک ہے',
    }
  }[lang];

  return (
    <div className="flex flex-col items-center justify-center py-2">
      {/* Simulation Controls for the Phone frame */}
      <div className={`w-full max-w-[390px] mb-3 flex items-center justify-between text-xs p-2.5 rounded-2xl shadow-sm transition-colors ${
        isLight ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-900 border border-slate-800 text-slate-200'
      }`}>
        {/* Language selector */}
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-amber-600 font-bold" />
          {(['EN', 'AR', 'UR'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                lang === l 
                  ? 'bg-amber-500 text-slate-950 font-black' 
                  : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Offline / Online toggle */}
        <button
          onClick={() => {
            if (isOffline && bufferedBreadcrumbs > 0) {
              alert(`Network Restored! Syncing ${bufferedBreadcrumbs} breadcrumbs from SQLite buffer to Kasper API... Done.`);
              setBufferedBreadcrumbs(0);
            }
            setIsOffline(!isOffline);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
            isOffline 
              ? 'bg-rose-500/15 text-rose-700 border border-rose-500/40 animate-pulse' 
              : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/40'
          }`}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          {isOffline ? `Offline (${bufferedBreadcrumbs})` : 'Online'}
        </button>
      </div>

      {/* Realistic Mobile Device Container (iPhone 16 Pro Frame) */}
      <div className={`relative w-[385px] h-[760px] rounded-[50px] p-3 shadow-2xl border-4 flex flex-col overflow-hidden select-none transition-colors ${
        isLight
          ? 'bg-slate-300 border-slate-400/80 ring-1 ring-slate-400 shadow-slate-300/60'
          : 'bg-black border-slate-700/80 ring-1 ring-slate-600 shadow-2xl'
      } ${lang === 'AR' || lang === 'UR' ? 'font-sans' : ''}`}>
        
        {/* Screen Bezel Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center gap-2 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-blue-950"></div>
        </div>

        {/* Device Inner Screen */}
        <div className={`relative w-full h-full rounded-[42px] overflow-hidden flex flex-col transition-colors ${
          isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
        }`}>
          
          {/* iOS Top Status Bar */}
          <div className={`pt-3.5 px-6 pb-2 flex items-center justify-between text-[11px] font-bold tracking-wider z-30 ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}>
            <span>08:42</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <span className="text-[10px] font-mono">5G</span>
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* App Header */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                K
              </div>
              <div>
                <div className="font-black text-xs tracking-wider">{t.appName}</div>
                <div className="text-amber-600 font-mono text-[10px] font-bold">{trip.vehiclePlate}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-500 text-[9px] uppercase font-bold">{trip.driverName}</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE GPS
              </div>
            </div>
          </div>

          {/* Offline Sync Banner if offline */}
          {isOffline ? (
            <div className="bg-rose-100 border-b border-rose-300 px-3 py-1.5 text-[10px] flex items-center justify-between text-rose-800">
              <span className="flex items-center gap-1 font-bold">
                <WifiOff className="w-3 h-3 text-rose-600" />
                {t.offlineActive}
              </span>
              <span className="font-mono bg-rose-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                {bufferedBreadcrumbs} queued
              </span>
            </div>
          ) : (
            <div className={`border-b px-3 py-1 text-[9px] flex items-center justify-center gap-1 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
            }`}>
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{t.tripGatedNotice}</span>
            </div>
          )}

          {/* Tab Navigation Pill in Mobile */}
          <div className="px-3 pt-2">
            <div className={`flex p-1 rounded-xl border text-xs ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => setActiveTab('TRIP')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === 'TRIP' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.activeTrip}
              </button>
              <button
                onClick={() => setActiveTab('INSPECT')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === 'INSPECT' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.inspection}
              </button>
              <button
                onClick={() => setActiveTab('EPOD')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === 'EPOD' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.epodTitle}
              </button>
            </div>
          </div>

          {/* Screen Body Content (Internal Smooth Scroll) */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* TAB 1: TRIP WORKFLOW */}
            {activeTab === 'TRIP' && (
              <div className="space-y-3">
                {/* Cargo Specification Card */}
                <div className={`rounded-2xl p-3.5 space-y-2 border transition-colors ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">{t.cargo}</span>
                    <span className="font-mono text-[10px] text-slate-400">{trip.id}</span>
                  </div>
                  <div className="font-black text-sm leading-snug">
                    {trip.cargoDescription}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                    <span>WEIGHT: <strong className="text-slate-800 dark:text-slate-200">{trip.cargoWeightTon} TON</strong></span>
                    <span>•</span>
                    <span>PERMIT: <strong className="text-emerald-600">RTA OK</strong></span>
                  </div>
                </div>

                {/* Route Waypoints */}
                <div className={`rounded-2xl p-3.5 space-y-3 border transition-colors ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  {/* Origin */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                      A
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-emerald-600 uppercase font-bold">{t.pickup}</div>
                      <div className="text-xs font-bold leading-tight">{trip.originName}</div>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-300 dark:border-slate-700 ml-3 h-4"></div>

                  {/* Destination */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500 flex items-center justify-center text-rose-700 text-xs font-bold shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-rose-600 uppercase font-bold">{t.drop}</div>
                      <div className="text-xs font-bold leading-tight">{trip.destinationName}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5 font-mono">
                        ETA: ~{trip.etaMinutes} mins ({trip.distanceRemainingKm} km)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Action Buttons - Field Driver Optimized with Oversized Touch Targets */}
                <div className="pt-1 space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center">
                    TRIP STATUS: <span className="text-amber-600 font-bold">{tripState}</span>
                  </div>

                  {tripState === 'ASSIGNED' && (
                    <button
                      onClick={() => {
                        setTripState('ARRIVED_PICKUP');
                        if (onTripStatusChange) onTripStatusChange('ARRIVED_PICKUP');
                      }}
                      className="w-full h-14 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform"
                    >
                      <Navigation className="w-5 h-5" />
                      {t.startPickup}
                    </button>
                  )}

                  {tripState === 'ARRIVED_PICKUP' && (
                    <button
                      onClick={() => {
                        setTripState('IN_TRANSIT');
                        if (onTripStatusChange) onTripStatusChange('IN_TRANSIT');
                      }}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform"
                    >
                      <Truck className="w-5 h-5" />
                      {t.startTransit}
                    </button>
                  )}

                  {tripState === 'IN_TRANSIT' && (
                    <button
                      onClick={() => {
                        setTripState('ARRIVED_DESTINATION');
                        if (onTripStatusChange) onTripStatusChange('ARRIVED_DESTINATION');
                      }}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform"
                    >
                      <MapPin className="w-5 h-5" />
                      {t.arrivedSite}
                    </button>
                  )}

                  {tripState === 'ARRIVED_DESTINATION' && (
                    <button
                      onClick={() => setActiveTab('EPOD')}
                      className="w-full h-14 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform"
                    >
                      <PenTool className="w-5 h-5" />
                      {t.completeEpod}
                    </button>
                  )}

                  {tripState === 'DELIVERED' && (
                    <div className="w-full py-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div className="text-slate-900 font-bold text-sm">TRIP DELIVERED & CLOSED</div>
                      <div className="text-slate-500 text-[10px]">ePOD Stored with Cryptographic Signature</div>
                    </div>
                  )}

                  {/* Quick Site Contact Button */}
                  <a
                    href="tel:+971529845512"
                    className={`w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-colors ${
                      isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Call Site Engineer (Eng. Mustafa)
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: PRE-TRIP INSPECTION */}
            {activeTab === 'INSPECT' && (
              <div className="space-y-3">
                <div className={`rounded-2xl p-3.5 space-y-2 border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">SAFETY AUDIT CHECKLIST</span>
                    <span className="text-emerald-600 text-[10px] font-bold">5/5 PASSED</span>
                  </div>
                  <div className="space-y-2 text-xs pt-1">
                    {Object.entries({
                      chainsTension: '4x Ratchet Binder Chains (20T Rated)',
                      tirePressure: 'Tire Pressure & Axle Wheel Nuts',
                      brakeAirLines: 'Dual-line Pneumatic Air Brake Pressure',
                      warningLights: 'Rotating Beacon & Wide Load Flags',
                      oversizeBanner: 'Rear Oversize Load Arabic/English Board'
                    }).map(([key, label]) => (
                      <label key={key} className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-[11px] font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Camera Watermark Preview */}
                <div className={`rounded-2xl p-3.5 space-y-2 border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">PHOTO AUDIT WATERMARK</span>
                  <div className="relative h-28 bg-slate-900 rounded-xl border border-slate-200 overflow-hidden flex items-end p-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="relative z-10 text-[9px] font-mono text-amber-300 leading-tight">
                      <div>KASPER FLEET TELEMATICS • AUDIT PHOTO</div>
                      <div>DATE: 2026-11-02 08:31:14 GST</div>
                      <div>GPS: 24.8934° N, 55.1582° E • SPEED: 0 KM/H</div>
                      <div>PLATE: {trip.vehiclePlate}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPhotosCount(prev => prev + 1);
                      alert('Inspection photo captured with GPS & timestamp overlay saved to SQLite buffer.');
                    }}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border transition-colors ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    Capture Photo ({photosCount} Attached)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ePOD SIGNATURE CANVAS */}
            {activeTab === 'EPOD' && (
              <div className="space-y-3">
                <div className={`rounded-2xl p-3.5 space-y-3 border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">{t.epodTitle}</span>
                    <span className="font-mono text-[9px] text-slate-400">KSP-POD-94821</span>
                  </div>

                  {/* Receiver Fields */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-500 text-[10px] font-bold block mb-0.5">{t.receiver}</label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-semibold border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] font-bold block mb-0.5">{t.designation}</label>
                      <input
                        type="text"
                        value={receiverRole}
                        onChange={(e) => setReceiverRole(e.target.value)}
                        className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-semibold border ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Interactive Signature Canvas */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{t.signHere}</span>
                      <button
                        onClick={clearCanvas}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700"
                      >
                        {t.clear}
                      </button>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 h-28 touch-none">
                      <canvas
                        ref={canvasRef}
                        width={330}
                        height={112}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair"
                      />
                    </div>
                  </div>

                  {/* Submit Delivery Proof */}
                  <button
                    onClick={() => {
                      if (!hasSignature) {
                        alert('Please sign on the canvas to confirm delivery.');
                        return;
                      }
                      setEpodSubmitted(true);
                      setTripState('DELIVERED');
                      if (onTripStatusChange) onTripStatusChange('DELIVERED');
                      alert('ePOD Submitted Successfully! Cryptographic Consignment Note generated and synced.');
                      setActiveTab('TRIP');
                    }}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.submitPOD}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* iOS Bottom Navigation Bar Handle */}
          <div className="h-5 flex items-center justify-center pb-2">
            <div className={`w-32 h-1 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
