'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TripData, DUMMY_TRIPS } from '../../data/dummyData';
import { 
  Truck, Navigation, ShieldCheck, Camera, CheckSquare, 
  MapPin, Phone, WifiOff, Wifi, Globe, PenTool, CheckCircle2,
  RefreshCw, FileText, ArrowRight, Battery, Signal, ArrowLeft,
  Smartphone, Upload, ImageIcon, Sparkles
} from './Icons';

interface DriverMobileViewProps {
  trip?: TripData;
  onTripStatusChange?: (newStatus: TripData['status']) => void;
  theme?: 'light' | 'dark';
  onBackToLaunchpad?: () => void;
}

type Language = 'EN' | 'AR' | 'UR';

export default function DriverMobileView({ 
  trip, 
  onTripStatusChange,
  theme = 'light',
  onBackToLaunchpad
}: DriverMobileViewProps) {
  const safeTrip = trip || DUMMY_TRIPS[0];
  const isLight = theme === 'light';
  const [lang, setLang] = useState<Language>('EN');
  const [activeTab, setActiveTab] = useState<'TRIP' | 'INSPECT' | 'EPOD'>('TRIP');
  const [isOffline, setIsOffline] = useState(false);
  const [bufferedBreadcrumbs, setBufferedBreadcrumbs] = useState(0);
  const [tripState, setTripState] = useState<TripData['status']>(safeTrip?.status || 'IN_TRANSIT');
  
  // Signature pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [receiverName, setReceiverName] = useState('Eng. Mustafa Al-Hashimi');
  const [receiverRole, setReceiverRole] = useState('Senior Site Logistics Engineer');
  const [epodSubmitted, setEpodSubmitted] = useState(false);

  // Photo-First ePOD States
  const [docPhotoAttached, setDocPhotoAttached] = useState(true);
  const [cargoPhotoAttached, setCargoPhotoAttached] = useState(true);
  const [customDocImage, setCustomDocImage] = useState<string | null>(null);
  const [customCargoImage, setCustomCargoImage] = useState<string | null>(null);
  const [photoFlash, setPhotoFlash] = useState<boolean>(false);
  const [selectedRemark, setSelectedRemark] = useState<string>('Offloaded in good condition. Stamped delivery order verified.');
  const [showOptionalSignature, setShowOptionalSignature] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const cargoFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomDocImage(event.target?.result as string);
        setDocPhotoAttached(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCargoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomCargoImage(event.target?.result as string);
        setCargoPhotoAttached(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCameraClick = (type: 'DOC' | 'CARGO') => {
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 250);
    if (type === 'DOC') {
      setDocPhotoAttached(true);
    } else {
      setCargoPhotoAttached(true);
    }
  };

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

  const updateStage = (stage: TripData['status']) => {
    setTripState(stage);
    if (onTripStatusChange) onTripStatusChange(stage);
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
      completeEpod: 'PHOTO ePOD & DELIVER',
      inspection: 'PRE-TRIP CHECK',
      epodTitle: 'PHOTO ePOD',
      receiver: 'RECEIVER NAME',
      designation: 'DESIGNATION',
      signHere: 'OPTIONAL TOUCH SIGNATURE',
      clear: 'CLEAR',
      submitPOD: 'SUBMIT STAMPED ePOD & DELIVER',
      tripGatedNotice: 'Privacy Active: GPS only streamed while trip is in progress',
      offlineActive: 'OFFLINE MODE: Buffered in SQLite',
      onlineActive: 'ONLINE: Connected to Kasper Ingestion API',
      docPhotoTitle: '1. Stamped Delivery Note (Paper DO)',
      cargoPhotoTitle: '2. Offloaded Equipment on Site',
      clickPhoto: 'Click Photo',
      attachPhoto: 'Attach Photo',
      watermarkVerified: 'GPS & Time Watermark Verified',
      quickRemarks: 'Delivery Notes',
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
      completeEpod: 'تصوير سند التسليم المختوم (ePOD)',
      inspection: 'الفحص الميداني',
      epodTitle: 'إثبات التسليم بالصور',
      receiver: 'اسم المستلم المعتمد',
      designation: 'الصفة الوظيفية',
      signHere: 'توقيع إلكتروني اختياري باللمس',
      clear: 'مسح التوقيع',
      submitPOD: 'اعتماد سند التسليم المختوم والإنهاء',
      tripGatedNotice: 'الخصوصية مفعلة: يتم تتبع الموقع فقط خلال سير الرحلة',
      offlineActive: 'وضع عدم الاتصال: يتم الحفظ محلياً في SQLite',
      onlineActive: 'متصل: جاهز لإرسال البيانات',
      docPhotoTitle: '١. سند التسليم المختوم والموقع (DO)',
      cargoPhotoTitle: '٢. صورة المعدة المنزلة في الموقع',
      clickPhoto: 'التقاط صورة',
      attachPhoto: 'إرفاق صورة',
      watermarkVerified: 'بصمة الموقع الجغرافي والوقت موثقة',
      quickRemarks: 'ملاحظات التسليم',
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
      completeEpod: 'تصویری رسید اور ڈلیوری (ePOD)',
      inspection: 'گاڑی کا معائنہ',
      epodTitle: 'تصویری ثبوت رسید',
      receiver: 'وصول کنندہ کا نام',
      designation: 'عہدہ',
      signHere: 'اختیاری سائن',
      clear: 'دوبارہ سائن کریں',
      submitPOD: 'مہر شدہ رسید جمع کرائیں',
      tripGatedNotice: 'پرائیویسی فعال: لوکیشن صرف فعال سفر کے دوران ریکارڈ ہوگی',
      offlineActive: 'آف لائن موڈ: لوکل اسٹوریج میں محفوظ ہو رہا ہے',
      onlineActive: 'آن لائن: سسٹم سے منسلک ہے',
      docPhotoTitle: '1. مہر لگی رسید کی تصویر (DO)',
      cargoPhotoTitle: '2. سائیٹ پر اتارے گئے سامان کی تصویر',
      clickPhoto: 'تصویر بنائیں',
      attachPhoto: 'تصویر لگائیں',
      watermarkVerified: 'GPS اور وقت تصدیق شدہ',
      quickRemarks: 'ڈلیوری نوٹس',
    }
  }[lang];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 py-1 w-full max-w-6xl mx-auto">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN: SIMULATOR CONTROL STUDIO & AUDIT PANEL */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[380px] space-y-3.5 order-2 lg:order-1">
        
        {/* Simulator Info Card */}
        <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Driver App Simulator</h3>
                <span className="text-[10px] text-slate-500 font-mono">STANDALONE MOBILE EXPO 52</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 text-[10px] font-mono font-bold">
              SCREEN FIT
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Heavy haulage driver interface designed for zero jargon, oversized touch zones, and harsh desert sunlight visibility.
          </p>

          {/* Active Trip Metadata Chip */}
          <div className={`mt-3 p-2.5 rounded-xl border text-xs font-mono space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">VEHICLE:</span>
              <strong>{safeTrip?.vehiclePlate || 'DXB-T-49102'} ({(safeTrip?.vehicleType || 'Flatbed 40ft').split(' ')[0]})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">DRIVER:</span>
              <strong>{safeTrip?.driverName || 'Rashid Khan'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">CARGO:</span>
              <strong className="text-amber-600 truncate max-w-[180px]">{safeTrip?.cargoDescription || 'Excavator'}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Studio Controls */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {/* Language Switcher */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-mono">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                DRIVER LANGUAGE
              </span>
              <span className="text-[10px] font-mono text-slate-400">EN / AR / UR</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['EN', 'AR', 'UR'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                    lang === l 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20' 
                      : isLight 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {l === 'EN' ? 'English' : l === 'AR' ? 'العربية' : 'اردو'}
                </button>
              ))}
            </div>
          </div>

          {/* Network Offline Simulation Toggle */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 text-xs font-mono">CONNECTIVITY ENGINE</span>
              <span className="text-[10px] font-mono text-slate-400">SQLite Offline Buffer</span>
            </div>
            <button
              onClick={() => {
                if (isOffline && bufferedBreadcrumbs > 0) {
                  alert(`Network Restored! Syncing ${bufferedBreadcrumbs} buffered breadcrumbs to Kasper Ingestion API... Success.`);
                  setBufferedBreadcrumbs(0);
                }
                setIsOffline(!isOffline);
              }}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                isOffline 
                  ? 'bg-rose-500/15 text-rose-700 border border-rose-500/40' 
                  : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isOffline ? <WifiOff className="w-4 h-4 text-rose-600 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                {isOffline ? 'Offline Mode (Desert Corridor)' : 'Online (4G / 5G Ingestion Stream)'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">
                {isOffline ? `${bufferedBreadcrumbs} Queued` : 'Active 5s'}
              </span>
            </button>
          </div>

          {/* Quick Stage Simulator */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 text-xs font-mono">QUICK-JUMP TRIP STAGE</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono font-semibold">
              <button
                onClick={() => updateStage('ASSIGNED')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  tripState === 'ASSIGNED' ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                1. Yard Inspection
              </button>
              <button
                onClick={() => updateStage('IN_TRANSIT')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  tripState === 'IN_TRANSIT' ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                2. On Highway (GPS)
              </button>
              <button
                onClick={() => updateStage('ARRIVED_DESTINATION')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  tripState === 'ARRIVED_DESTINATION' ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                3. Arrived at Site
              </button>
              <button
                onClick={() => {
                  updateStage('DELIVERED');
                  setActiveTab('EPOD');
                }}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  tripState === 'DELIVERED' ? 'bg-emerald-600 text-white font-bold border-emerald-600' : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                4. Sign ePOD
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition Note */}
        <div className={`p-3 rounded-xl border text-[11px] space-y-1 transition-colors ${
          isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="font-bold flex items-center gap-1.5 text-amber-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Trip-Gated Privacy Architecture
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Location telemetry is strictly restricted between trip start and ePOD sign-off. Eliminates driver pushback and ensures zero invasion of off-duty privacy.
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: REALISTIC COMPACT IPHONE SIMULATOR */}
      {/* Fits comfortably within 1080p and 768p laptop viewports */}
      {/* ======================================================== */}
      <div className="order-1 lg:order-2 flex flex-col items-center">
        
        {/* Device Container: Fixed comfortable height ~580px */}
        <div className={`relative w-[340px] sm:w-[350px] h-[580px] rounded-[46px] p-2.5 shadow-2xl border-4 flex flex-col overflow-hidden select-none transition-colors ${
          isLight
            ? 'bg-slate-300 border-slate-400/90 ring-1 ring-slate-400 shadow-slate-300/60'
            : 'bg-black border-slate-700/80 ring-1 ring-slate-600 shadow-2xl'
        } ${lang === 'AR' || lang === 'UR' ? 'font-sans' : ''}`}>
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
          </div>

          {/* Device Inner Screen */}
          <div className={`relative w-full h-full rounded-[38px] overflow-hidden flex flex-col transition-colors ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
          }`}>
            
            {/* iOS Top Status Bar */}
            <div className={`pt-3 px-5 pb-1.5 flex items-center justify-between text-[10px] font-bold tracking-wider z-30 ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <span>08:42</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3" />
                <span className="text-[9px] font-mono">5G</span>
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>

            {/* App Header */}
            <div className={`px-3.5 py-2 border-b flex items-center justify-between transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                  K
                </div>
                <div>
                  <div className="font-black text-xs tracking-wider">{t.appName}</div>
                  <div className="text-amber-600 font-mono text-[9px] font-bold">{safeTrip?.vehiclePlate || 'DXB-T-49102'}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-slate-500 text-[9px] uppercase font-bold">{(safeTrip?.driverName || 'Rashid').split(' ')[0]}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ACTIVE GPS
                </div>
              </div>
            </div>

            {/* Offline Sync Banner if offline */}
            {isOffline ? (
              <div className="bg-rose-100 border-b border-rose-300 px-3 py-1 text-[9px] flex items-center justify-between text-rose-800 font-bold">
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-rose-600" />
                  {t.offlineActive}
                </span>
                <span className="font-mono bg-rose-200 px-1 py-0.5 rounded text-[8px]">
                  {bufferedBreadcrumbs} queued
                </span>
              </div>
            ) : (
              <div className={`border-b px-2.5 py-0.5 text-[8.5px] flex items-center justify-center gap-1 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
              }`}>
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>{t.tripGatedNotice}</span>
              </div>
            )}

            {/* Tab Navigation Pill in Mobile */}
            <div className="px-3 pt-1.5">
              <div className={`flex p-0.5 rounded-xl border text-xs ${
                isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <button
                  onClick={() => setActiveTab('TRIP')}
                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all ${
                    activeTab === 'TRIP' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.activeTrip}
                </button>
                <button
                  onClick={() => setActiveTab('INSPECT')}
                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all ${
                    activeTab === 'INSPECT' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.inspection}
                </button>
                <button
                  onClick={() => setActiveTab('EPOD')}
                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all ${
                    activeTab === 'EPOD' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.epodTitle}
                </button>
              </div>
            </div>

            {/* Screen Body Content (Internal Smooth Scroll) */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5">
              
              {/* TAB 1: TRIP WORKFLOW */}
              {activeTab === 'TRIP' && (
                <div className="space-y-2.5">
                  {/* Cargo Specification Card */}
                  <div className={`rounded-xl p-3 space-y-1.5 border transition-colors ${
                    isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">{t.cargo}</span>
                      <span className="font-mono text-[9px] text-slate-400">{safeTrip?.id || 'KSP-EQ-101'}</span>
                    </div>
                    <div className="font-black text-xs leading-snug">
                      {safeTrip?.cargoDescription || 'CAT 320D Excavator'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                      <span>WEIGHT: <strong className="text-slate-800 dark:text-slate-200">{safeTrip?.cargoWeightTon || 22.4} TON</strong></span>
                      <span>•</span>
                      <span>PERMIT: <strong className="text-emerald-600">RTA OK</strong></span>
                    </div>
                  </div>

                  {/* Route Waypoints */}
                  <div className={`rounded-xl p-3 space-y-2 border transition-colors ${
                    isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}>
                    {/* Origin */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0 mt-0.5">
                        A
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-emerald-600 uppercase font-bold">{t.pickup}</div>
                        <div className="font-bold text-xs">{safeTrip?.originName || 'Dubai Logistics City'}</div>
                      </div>
                    </div>

                    <div className="ml-2.5 pl-2 border-l border-dashed border-slate-300 dark:border-slate-700 py-0.5 text-[9px] font-mono text-slate-400">
                      Corridor E11 • ~{safeTrip?.distanceRemainingKm || 45} km
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500 flex items-center justify-center text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">
                        B
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-amber-600 uppercase font-bold">{t.drop}</div>
                        <div className="font-bold text-xs">{safeTrip?.destinationName || 'Saadiyat Island'}</div>
                      </div>
                    </div>
                  </div>

                  {/* High-Impact Primary Action Button */}
                  <div className="pt-1">
                    {tripState === 'ASSIGNED' && (
                      <button
                        onClick={() => updateStage('IN_TRANSIT')}
                        className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-transform"
                      >
                        <Navigation className="w-4 h-4" />
                        {t.startTransit}
                      </button>
                    )}

                    {tripState === 'IN_TRANSIT' && (
                      <button
                        onClick={() => updateStage('ARRIVED_DESTINATION')}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-transform"
                      >
                        <MapPin className="w-4 h-4" />
                        {t.arrivedSite}
                      </button>
                    )}

                    {tripState === 'ARRIVED_DESTINATION' && (
                      <button
                        onClick={() => setActiveTab('EPOD')}
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-transform animate-bounce"
                      >
                        <Camera className="w-4 h-4" />
                        {t.completeEpod}
                      </button>
                    )}

                    {tripState === 'DELIVERED' && (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        DELIVERY COMPLETED & STAMPED ePOD ATTACHED
                      </div>
                    )}
                  </div>

                  {/* Telemetry live health meter */}
                  <div className={`p-2 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <span>SPEED: <strong className="text-slate-800 dark:text-slate-200">{safeTrip?.speedKmh || 65} KM/H</strong></span>
                    <span>BATTERY: <strong className="text-emerald-600">{(safeTrip?.batteryPct ?? 88).toFixed(0)}%</strong></span>
                    <span>INTERVAL: <strong className="text-blue-600">5 SEC</strong></span>
                  </div>
                </div>
              )}

              {/* TAB 2: PRE-TRIP INSPECTION CHECKLIST */}
              {activeTab === 'INSPECT' && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                    RTA Pre-Trip Safety Audit Checklist
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {[
                      { key: 'chainsTension', label: 'Heavy Chain & Binder Tension (4-Point)' },
                      { key: 'tirePressure', label: 'Tire Pressure & Axle Inspection (80 PSI)' },
                      { key: 'brakeAirLines', label: 'Dual Air Brake Pressure (120 PSI Checked)' },
                      { key: 'warningLights', label: 'Flashing Amber Beacon & Hazard Lights' },
                      { key: 'oversizeBanner', label: 'Wide Load Safety Banner & Flags Secured' }
                    ].map(item => (
                      <div
                        key={item.key}
                        onClick={() => setInspectionChecks(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          inspectionChecks[item.key as keyof typeof inspectionChecks]
                            ? isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                            : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CheckSquare className={`w-4 h-4 shrink-0 ${
                          inspectionChecks[item.key as keyof typeof inspectionChecks] ? 'text-emerald-600' : 'text-slate-400'
                        }`} />
                        <span className="font-semibold text-[11px]">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Watermark Photos Counter */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      GPS Watermark Photos
                    </div>
                    <button
                      onClick={() => setPhotosCount(prev => prev + 1)}
                      className="px-2 py-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px]"
                    >
                      + Add Photo ({photosCount})
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ELECTRONIC PROOF OF DELIVERY (ePOD) - PHOTO-FIRST */}
              {activeTab === 'EPOD' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Photo Proof of Delivery (ePOD)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 text-[9px] font-mono font-bold">
                      FIELD STANDARD
                    </span>
                  </div>

                  {/* Hidden native file inputs for real device camera / photo upload */}
                  <input 
                    ref={docFileInputRef} 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleDocFileUpload} 
                  />
                  <input 
                    ref={cargoFileInputRef} 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleCargoFileUpload} 
                  />

                  {/* Camera Flash Animation Indicator */}
                  {photoFlash && (
                    <div className="fixed inset-0 z-50 bg-white/90 pointer-events-none transition-opacity duration-200 animate-ping"></div>
                  )}

                  {/* ======================================================== */}
                  {/* PHOTO 1: STAMPED PHYSICAL DELIVERY NOTE / DO (MANDATORY) */}
                  {/* ======================================================== */}
                  <div className={`p-2.5 rounded-xl border space-y-2 transition-colors ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-[11px]">{t.docPhotoTitle}</span>
                      </div>
                      {docPhotoAttached ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          ATTACHED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                          REQUIRED
                        </span>
                      )}
                    </div>

                    {/* Stamped Document Preview Box */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-950 p-2 text-left">
                      {customDocImage ? (
                        <img 
                          src={customDocImage} 
                          alt="Uploaded Delivery Note" 
                          className="w-full h-28 object-cover rounded" 
                        />
                      ) : (
                        <div className="space-y-1 select-none">
                          <div className="flex justify-between items-start border-b border-dashed border-slate-300 dark:border-slate-800 pb-1">
                            <div>
                              <div className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                AL NABOODAH CONTRACTING LLC
                              </div>
                              <div className="text-[8px] text-slate-500 font-mono">
                                PROJECT SITE DELIVERY RECEIPT • DO-2026-9941
                              </div>
                            </div>
                            <span className="text-[8px] font-mono bg-blue-100 text-blue-800 font-bold px-1 rounded">
                              ORIGINAL
                            </span>
                          </div>

                          <div className="text-[8.5px] text-slate-600 dark:text-slate-400 font-mono py-0.5">
                            <div>CARGO: <strong className="text-slate-900 dark:text-slate-100">{safeTrip?.cargoDescription || 'Excavator'}</strong></div>
                            <div>DEST: {safeTrip?.destinationName || 'Saadiyat Cultural District'}</div>
                          </div>

                          {/* Official Red & Blue Rubber Stamp with Signature Overlay */}
                          <div className="pt-1 flex items-center justify-between">
                            <div className="relative inline-block border-2 border-dashed border-rose-600 text-rose-600 rounded px-2 py-0.5 -rotate-2 bg-rose-50/80 shadow-xs">
                              <div className="text-[7.5px] font-black tracking-widest text-center leading-none">
                                ★ RECEIVED & STAMPED ★
                              </div>
                              <div className="text-[7px] font-bold text-center leading-none mt-0.5">
                                SAADIYAT SITE OFFICE
                              </div>
                              <div className="text-[6.5px] font-mono text-center text-rose-800">
                                03-NOV-2026 • GATE 3
                              </div>
                              {/* Blue ink handwritten signature stroke */}
                              <svg className="absolute -inset-1 w-full h-full pointer-events-none" viewBox="0 0 100 30">
                                <path d="M 5 22 Q 30 5 45 20 T 75 10 T 95 18" stroke="#1D4ED8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                              </svg>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-[8px] text-slate-500 font-mono">SITE ENGINEER</div>
                              <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200">{receiverName}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* GPS Cryptographic Watermark Ribbon */}
                      <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[7.5px] font-mono text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-amber-500" />
                          24.5332° N, 54.4021° E
                        </span>
                        <span>08:42 AM GST</span>
                        <span className="text-emerald-600 font-bold">SHA-256 ✓</span>
                      </div>
                    </div>

                    {/* Photo Action Buttons: Click Photo vs Attach Photo */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => triggerCameraClick('DOC')}
                        className="py-1.5 px-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-transform"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {t.clickPhoto}
                      </button>

                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 border transition-colors ${
                          isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {t.attachPhoto}
                      </button>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* PHOTO 2: OFFLOADED EQUIPMENT / CARGO ON SITE */}
                  {/* ======================================================== */}
                  <div className={`p-2.5 rounded-xl border space-y-2 transition-colors ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-[11px]">{t.cargoPhotoTitle}</span>
                      </div>
                      {cargoPhotoAttached ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          ATTACHED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400">OPTIONAL</span>
                      )}
                    </div>

                    {/* Offload Photo Viewport */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 h-20 flex items-center justify-center p-2 text-center">
                      {customCargoImage ? (
                        <img 
                          src={customCargoImage} 
                          alt="Offloaded Cargo on Site" 
                          className="w-full h-full object-cover rounded" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 z-10">
                            <span>🚜</span>
                            <span>{safeTrip?.cargoDescription?.split(' ')[0] || 'Equipment'} Offloaded at Site Laydown Bay 4</span>
                          </div>
                          <div className="text-[8px] font-mono text-emerald-700 dark:text-emerald-400 font-bold z-10 mt-0.5">
                            ✓ Visual Inspection Complete • Zero Mechanical Damage
                          </div>
                          <div className="absolute bottom-1 right-2 text-[7.5px] font-mono text-slate-500">
                            GPS Verified Site Placement
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cargo Photo Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => triggerCameraClick('CARGO')}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 border transition-colors ${
                          isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        {t.clickPhoto}
                      </button>

                      <button
                        type="button"
                        onClick={() => cargoFileInputRef.current?.click()}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 border transition-colors ${
                          isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                        {t.attachPhoto}
                      </button>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* RECEIVER & QUICK DELIVERY REMARKS */}
                  {/* ======================================================== */}
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8.5px] font-mono text-slate-500 font-bold block mb-0.5">{t.receiver}</label>
                        <input
                          type="text"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className={`w-full rounded-lg px-2 py-1 text-[11px] font-semibold border ${
                            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[8.5px] font-mono text-slate-500 font-bold block mb-0.5">{t.designation}</label>
                        <input
                          type="text"
                          value={receiverRole}
                          onChange={(e) => setReceiverRole(e.target.value)}
                          className={`w-full rounded-lg px-2 py-1 text-[11px] font-semibold border ${
                            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Quick Remark Chips */}
                    <div>
                      <label className="text-[8.5px] font-mono text-slate-500 font-bold block mb-1">
                        {t.quickRemarks}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Offloaded in good condition. Stamped delivery order verified.',
                          'Gate pass cleared. Offloaded at bay without delay.',
                          'Security inspection passed. Clean handover.'
                        ].map(remark => (
                          <button
                            key={remark}
                            type="button"
                            onClick={() => setSelectedRemark(remark)}
                            className={`text-[9px] px-2 py-0.5 rounded-full border text-left transition-colors ${
                              selectedRemark === remark
                                ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {remark.slice(0, 32)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Collapsible Optional Touch Signature Pad */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOptionalSignature(!showOptionalSignature)}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" />
                        {showOptionalSignature ? 'Hide Optional Signature' : '+ Optional On-Screen Finger Signature'}
                      </button>

                      {showOptionalSignature && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[8.5px] font-mono text-slate-400">Touch signature on screen</span>
                            <button onClick={clearCanvas} className="text-[8.5px] font-bold text-rose-500">
                              Clear
                            </button>
                          </div>
                          <div className="bg-white rounded-lg overflow-hidden border border-slate-300 h-16 touch-none">
                            <canvas
                              ref={canvasRef}
                              width={310}
                              height={64}
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
                      )}
                    </div>
                  </div>

                  {/* Primary Submit Button: Stamped ePOD Submission */}
                  <button
                    onClick={() => {
                      if (!docPhotoAttached) {
                        alert('Please snap or attach the photo of the stamped delivery note first.');
                        return;
                      }
                      setEpodSubmitted(true);
                      updateStage('DELIVERED');
                      alert('✅ ePOD Confirmed! Physical stamped delivery order photo & GPS watermark saved to SQLite buffer and pushed to Ops Dispatch.');
                      setActiveTab('TRIP');
                    }}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.submitPOD}
                  </button>
                </div>
              )}
            </div>

            {/* iOS Bottom Navigation Bar Handle */}
            <div className="h-4 flex items-center justify-center pb-1">
              <div className={`w-28 h-1 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
