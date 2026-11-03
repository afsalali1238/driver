'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  TripData, DriverProfile, DriverScheduleBlock, DriverEarningsRecord,
  DUMMY_DRIVERS, DUMMY_DRIVER_SCHEDULES, DUMMY_DRIVER_EARNINGS 
} from '../data/dummyData';
import { 
  Truck, Navigation, ShieldCheck, Camera, CheckSquare, 
  MapPin, Phone, WifiOff, Wifi, Globe, PenTool, CheckCircle2,
  RefreshCw, FileText, ArrowRight, Battery, Signal, ArrowLeft,
  Calendar, DollarSign, UserCheck, Share2, AlertTriangle, Plus, Sparkles, MessageSquare
} from './Icons';
import WhatsAppDispatchModal from './WhatsAppDispatchModal';

interface DriverMobileViewProps {
  trip: TripData;
  onTripStatusChange?: (newStatus: TripData['status']) => void;
  theme?: 'light' | 'dark';
  onBackToLaunchpad?: () => void;
  onOpenCustomerView?: (token: string) => void;
}

type Language = 'EN' | 'AR' | 'UR';
type MainNavTab = 'TRIP' | 'CALENDAR' | 'EARNINGS' | 'DOCS';

export default function DriverMobileView({ 
  trip, 
  onTripStatusChange,
  theme = 'light',
  onBackToLaunchpad,
  onOpenCustomerView
}: DriverMobileViewProps) {
  const isLight = theme === 'light';
  const [lang, setLang] = useState<Language>('EN');
  const [mainNav, setMainNav] = useState<MainNavTab>('TRIP');
  const [tripSubTab, setTripSubTab] = useState<'ROUTE' | 'INSPECT' | 'EPOD'>('ROUTE');
  
  // Telematics & Offline state
  const [isOffline, setIsOffline] = useState(false);
  const [bufferedBreadcrumbs, setBufferedBreadcrumbs] = useState(0);
  const [tripState, setTripState] = useState<TripData['status']>(trip.status);
  const [linkCopied, setLinkCopied] = useState(false);

  // Driver Calendar State
  const [schedules, setSchedules] = useState<DriverScheduleBlock[]>(DUMMY_DRIVER_SCHEDULES);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('2026-11-04');
  const [newBlockType, setNewBlockType] = useState<DriverScheduleBlock['type']>('MAINTENANCE');
  const [newBlockNotes, setNewBlockNotes] = useState('Heavy Commercial Workshop Service');

  // Driver Earnings State
  const [earningsList, setEarningsList] = useState<DriverEarningsRecord[]>(DUMMY_DRIVER_EARNINGS);
  
  // Signature pad state for ePOD
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [receiverName, setReceiverName] = useState('Eng. Mustafa Al-Hashimi');
  const [receiverRole, setReceiverRole] = useState('Senior Site Logistics Engineer, Arabtec EPC');
  const [epodSubmitted, setEpodSubmitted] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isDvirCertified, setIsDvirCertified] = useState(false);

  // Pre-trip heavy equipment inspection checklist
  const [inspectionChecks, setInspectionChecks] = useState({
    chainsTension: true,
    boomLockGrounded: true,
    multiAxleTires: true,
    warningBeaconLights: true,
    bodyScratchesMarked: true
  });
  const [photosCount, setPhotosCount] = useState(4);

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

  const handleAddScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const typeNameMap: Record<DriverScheduleBlock['type'], DriverScheduleBlock['typeName']> = {
      TRIP_BOOKED: 'Trip Booked',
      MAINTENANCE: 'Truck Service',
      REST_PERIOD: 'Mandatory Rest',
      PERSONAL_LEAVE: 'Personal Leave'
    };

    const newBlock: DriverScheduleBlock = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      driverId: 'DRV-101',
      driverName: trip.driverName,
      date: newBlockDate,
      timeWindow: '08:00 - 18:00',
      type: newBlockType,
      typeName: typeNameMap[newBlockType],
      title: newBlockType === 'MAINTENANCE' ? 'Truck Workshop Service' : newBlockType === 'REST_PERIOD' ? 'Mandatory Driver Rest' : 'Personal Leave',
      notes: newBlockNotes
    };

    setSchedules(prev => [newBlock, ...prev]);
    setShowBlockModal(false);
  };

  const handleShareLiveLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?app=customer&token=${trip.trackingToken}`;
      navigator.clipboard?.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
      if (onOpenCustomerView) {
        onOpenCustomerView(trip.trackingToken);
      }
    }
  };

  // Translations dictionary
  const t = {
    EN: {
      appName: 'KASPER DRIVER',
      activeTrip: 'ACTIVE TRIP',
      calendar: 'CALENDAR',
      earnings: 'EARNINGS',
      docs: 'LICENSES & KYC',
      cargo: 'CARGO MANIFEST',
      pickup: 'PICKUP YARD',
      drop: 'DELIVERY SITE',
      startPickup: 'START TO PICKUP',
      arrivedPickup: 'ARRIVED AT PICKUP',
      startTransit: 'START TRANSIT (GPS ON)',
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
      shareLiveLink: 'Share Live Location Link',
      blockSlot: '+ Block Out Time',
      earnedThisWeek: 'Earned This Week',
      pendingPayout: 'Pending Clearance'
    },
    AR: {
      appName: 'كاسبر للسائقين',
      activeTrip: 'الرحلة النشطة',
      calendar: 'الجدول الزمني',
      earnings: 'الأرباح والمستحقات',
      docs: 'الرخص والتصاريح',
      cargo: 'بيانات الحمولة والمعدات',
      pickup: 'موقع الاستلام والتحميل',
      drop: 'موقع التسليم في المشروع',
      startPickup: 'بدء التحرك للاستلام',
      arrivedPickup: 'تم الوصول لموقع الاستلام',
      startTransit: 'بدء الرحلة (تشغيل التتبع)',
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
      shareLiveLink: 'مشاركة رابط التتبع المباشر',
      blockSlot: '+ حجز وقت خارج الخدمة',
      earnedThisWeek: 'أرباح هذا الأسبوع',
      pendingPayout: 'قيد الاعتماد'
    },
    UR: {
      appName: 'کیسپر ڈرائیور',
      activeTrip: 'موجودہ ٹرپ',
      calendar: 'کیلنڈر اور شیڈول',
      earnings: 'آمدنی اور کرایہ',
      docs: 'لائسنس اور دستاویزات',
      cargo: 'سامان کی تفصیل',
      pickup: 'پک اپ لوکیشن',
      drop: 'ڈلیوری سائیٹ',
      startPickup: 'پک اپ کے لیے روانہ ہوں',
      arrivedPickup: 'پک اپ پر پہنچ گئے',
      startTransit: 'سفر شروع کریں (GPS آن)',
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
      shareLiveLink: 'لائیو لوکیشن کا لنک شیئر کریں',
      blockSlot: '+ فارغ وقت بلاک کریں',
      earnedThisWeek: 'اس ہفتے کی کل کمائی',
      pendingPayout: 'منظوری کا منتظر'
    }
  }[lang];

  // Calculated earnings sums
  const totalEarnedAED = earningsList.reduce((acc, curr) => acc + curr.totalPayoutAED, 0);
  const pendingAED = earningsList
    .filter(e => e.status === 'PENDING_EPOD')
    .reduce((acc, curr) => acc + curr.totalPayoutAED, 0);

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
                <Truck className="w-4 h-4" />
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
            Zero hardware Teltonika box required ($0). GPS streams strictly during active trips with SQLite offline buffering.
          </p>

          {/* Active Trip Metadata Chip */}
          <div className={`mt-3 p-2.5 rounded-xl border text-xs font-mono space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">VEHICLE PLATE:</span>
              <strong>{trip.vehiclePlate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">ASSIGNED DRIVER:</span>
              <strong>{trip.driverName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[10px]">CARGO & WEIGHT:</span>
              <strong className="text-amber-600 truncate max-w-[170px]">{trip.cargoDescription} ({trip.cargoWeightTon}T)</strong>
            </div>
          </div>
        </div>

        {/* Live Location Sharing & Quick Jump Controls */}
        <div className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {/* Language Switcher */}
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
              FIELD LANGUAGE (ENGLISH / العربية / اردو)
            </label>
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                onClick={() => setLang('EN')}
                className={`py-1.5 rounded-lg transition-all ${
                  lang === 'EN' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('AR')}
                className={`py-1.5 rounded-lg transition-all font-sans ${
                  lang === 'AR' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang('UR')}
                className={`py-1.5 rounded-lg transition-all font-sans ${
                  lang === 'UR' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                اردو
              </button>
            </div>
          </div>

          {/* Offline Desert Mode Toggle */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">DESERT BLIND SPOT SIMULATION</span>
            </div>
            <button
              onClick={() => {
                setIsOffline(!isOffline);
                if (isOffline) {
                  // Flushing simulation
                  setTimeout(() => setBufferedBreadcrumbs(0), 1000);
                }
              }}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                isOffline 
                  ? 'bg-rose-500/15 text-rose-700 border border-rose-500/40' 
                  : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isOffline ? <WifiOff className="w-4 h-4 text-rose-600 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                {isOffline ? 'Offline (Desert Blind Spot)' : 'Online (4G / 5G Ingestion Stream)'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">
                {isOffline ? `${bufferedBreadcrumbs} Queued` : 'Streaming 5s'}
              </span>
            </button>
          </div>

          {/* Live Location Sharing Action & WhatsApp Alert */}
          <div className="space-y-1.5">
            <button
              onClick={handleShareLiveLink}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{linkCopied ? '✓ Tracking Link Copied!' : t.shareLiveLink}</span>
            </button>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Dispatch Alert (Simulate)</span>
            </button>
          </div>

          {/* Quick-Jump Trip Stage */}
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
                2. Highway (GPS On)
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
                  setMainNav('TRIP');
                  setTripSubTab('EPOD');
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
            Trip-Gated Privacy Guarantee
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Location telemetry is strictly restricted between trip start and ePOD sign-off. Off-duty drivers are guaranteed 0% background recording.
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: REALISTIC COMPACT IPHONE SIMULATOR */}
      {/* ======================================================== */}
      <div className="order-1 lg:order-2 flex flex-col items-center">
        
        {/* Device Container */}
        <div className={`relative w-[340px] sm:w-[350px] h-[610px] rounded-[46px] p-2.5 shadow-2xl border-4 flex flex-col overflow-hidden select-none transition-colors ${
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
                  <div className="text-amber-600 font-mono text-[9px] font-bold">{trip.vehiclePlate}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-slate-500 text-[9px] uppercase font-bold">{trip.driverName.split(' ')[0]}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {tripState === 'IN_TRANSIT' ? 'LIVE GPS' : 'STANDBY'}
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

            {/* MAIN APP NAVIGATION TABS (TRIP, CALENDAR, EARNINGS, DOCS) */}
            <div className="px-3 pt-1.5">
              <div className={`grid grid-cols-4 p-0.5 rounded-xl border text-[10px] font-bold ${
                isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <button
                  onClick={() => setMainNav('TRIP')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    mainNav === 'TRIP' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Trip
                </button>
                <button
                  onClick={() => setMainNav('CALENDAR')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    mainNav === 'CALENDAR' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setMainNav('EARNINGS')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    mainNav === 'EARNINGS' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Earnings
                </button>
                <button
                  onClick={() => setMainNav('DOCS')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    mainNav === 'DOCS' 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  KYC/Docs
                </button>
              </div>
            </div>

            {/* SCREEN BODY CONTENT */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-2.5">
              
              {/* =================================================== */}
              {/* TAB 1: TRIP WORKFLOW */}
              {/* =================================================== */}
              {mainNav === 'TRIP' && (
                <div className="space-y-2.5">
                  {/* Sub-tabs for Trip (Route, Inspect, ePOD) */}
                  <div className="flex gap-1 border-b pb-1 border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                    <button
                      onClick={() => setTripSubTab('ROUTE')}
                      className={`px-2 py-0.5 rounded-md ${tripSubTab === 'ROUTE' ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-black' : 'text-slate-500'}`}
                    >
                      Route Details
                    </button>
                    <button
                      onClick={() => setTripSubTab('INSPECT')}
                      className={`px-2 py-0.5 rounded-md ${tripSubTab === 'INSPECT' ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-black' : 'text-slate-500'}`}
                    >
                      Pre-Trip ({photosCount}📷)
                    </button>
                    <button
                      onClick={() => setTripSubTab('EPOD')}
                      className={`px-2 py-0.5 rounded-md ${tripSubTab === 'EPOD' ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-black' : 'text-slate-500'}`}
                    >
                      ePOD Sign
                    </button>
                  </div>

                  {tripSubTab === 'ROUTE' && (
                    <div className="space-y-2">
                      {/* Live Sharing Action Banner */}
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 font-bold text-[11px]">
                          <Share2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Customer Live Tracking</span>
                        </div>
                        <button
                          onClick={handleShareLiveLink}
                          className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold font-mono"
                        >
                          {linkCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>

                      {/* Cargo Specification Card */}
                      <div className={`rounded-xl p-2.5 space-y-1.5 border transition-colors ${
                        isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">{t.cargo}</span>
                          <span className="font-mono text-[9px] text-slate-400">{trip.id}</span>
                        </div>
                        <div className="font-black text-xs leading-snug">
                          {trip.cargoDescription}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                          <span>WEIGHT: <strong className="text-slate-800 dark:text-slate-200">{trip.cargoWeightTon} TON</strong></span>
                          <span>•</span>
                          <span>PERMIT: <strong className="text-emerald-600">RTA OK</strong></span>
                        </div>
                      </div>

                      {/* Route Waypoints */}
                      <div className={`rounded-xl p-2.5 space-y-2 border transition-colors ${
                        isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                      }`}>
                        {/* Origin */}
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center text-emerald-700 text-[9px] font-bold shrink-0 mt-0.5">
                            A
                          </div>
                          <div>
                            <div className="text-[8px] font-mono text-emerald-600 uppercase font-bold">{t.pickup}</div>
                            <div className="font-bold text-[11px]">{trip.originName}</div>
                          </div>
                        </div>

                        <div className="ml-2 pl-2 border-l border-dashed border-slate-300 dark:border-slate-700 py-0.5 text-[8.5px] font-mono text-slate-400">
                          Corridor E11 • ~{trip.distanceRemainingKm} km remaining
                        </div>

                        {/* Destination */}
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500 flex items-center justify-center text-amber-700 text-[9px] font-bold shrink-0 mt-0.5">
                            B
                          </div>
                          <div>
                            <div className="text-[8px] font-mono text-amber-600 uppercase font-bold">{t.drop}</div>
                            <div className="font-bold text-[11px]">{trip.destinationName}</div>
                          </div>
                        </div>
                      </div>

                      {/* High-Impact Primary Action Button */}
                      <div className="pt-0.5">
                        {tripState === 'ASSIGNED' && (
                          <button
                            onClick={() => updateStage('IN_TRANSIT')}
                            className="w-full h-10 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
                          >
                            <Navigation className="w-4 h-4" />
                            {t.startTransit}
                          </button>
                        )}

                        {tripState === 'IN_TRANSIT' && (
                          <button
                            onClick={() => updateStage('ARRIVED_DESTINATION')}
                            className="w-full h-10 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                          >
                            <MapPin className="w-4 h-4" />
                            {t.arrivedSite}
                          </button>
                        )}

                        {tripState === 'ARRIVED_DESTINATION' && (
                          <button
                            onClick={() => setTripSubTab('EPOD')}
                            className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 animate-pulse"
                          >
                            <PenTool className="w-4 h-4" />
                            {t.completeEpod}
                          </button>
                        )}

                        {tripState === 'DELIVERED' && (
                          <div className="w-full py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            DELIVERY COMPLETED & EPOD SIGNED
                          </div>
                        )}
                      </div>

                      {/* Telemetry live health meter */}
                      <div className={`p-2 rounded-lg border text-[9px] font-mono flex items-center justify-between ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <span>SPEED: <strong className="text-slate-800 dark:text-slate-200">{trip.speedKmh} KM/H</strong></span>
                        <span>BATTERY: <strong className="text-emerald-600">{trip.batteryPct.toFixed(0)}%</strong></span>
                        <span>PING: <strong className="text-blue-600">5s Live</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Pre-Trip Inspection (EquipmentShare DVIR Benchmark) */}
                  {tripSubTab === 'INSPECT' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                        <span>Heavy Equipment DVIR & Lash-Down</span>
                        <span className="text-amber-600 font-bold">4-POINT AUDIT</span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={inspectionChecks.chainsTension} 
                            onChange={() => setInspectionChecks(prev => ({ ...prev, chainsTension: !prev.chainsTension }))}
                            className="w-3.5 h-3.5 text-amber-500 rounded"
                          />
                          <span>4x Grade 80 Ratchet Chains (Tension Verified)</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={inspectionChecks.boomLockGrounded} 
                            onChange={() => setInspectionChecks(prev => ({ ...prev, boomLockGrounded: !prev.boomLockGrounded }))}
                            className="w-3.5 h-3.5 text-amber-500 rounded"
                          />
                          <span>Hydraulic Boom Lock Pin Engaged & Grounded</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={inspectionChecks.multiAxleTires} 
                            onChange={() => setInspectionChecks(prev => ({ ...prev, multiAxleTires: !prev.multiAxleTires }))}
                            className="w-3.5 h-3.5 text-amber-500 rounded"
                          />
                          <span>Multi-Axle Lowbed Tires & Lug Nut Torque</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={inspectionChecks.warningBeaconLights} 
                            onChange={() => setInspectionChecks(prev => ({ ...prev, warningBeaconLights: !prev.warningBeaconLights }))}
                            className="w-3.5 h-3.5 text-amber-500 rounded"
                          />
                          <span>Amber Flashing Beacon & Night Escort Lights</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={inspectionChecks.bodyScratchesMarked} 
                            onChange={() => setInspectionChecks(prev => ({ ...prev, bodyScratchesMarked: !prev.bodyScratchesMarked }))}
                            className="w-3.5 h-3.5 text-amber-500 rounded"
                          />
                          <span>Pre-existing Body Scratches & Dents Tagged</span>
                        </label>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-[11px] font-mono">Timestamped Cargo Scans: {photosCount}/4</span>
                        <button
                          onClick={() => setPhotosCount(prev => Math.min(4, prev + 1))}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] font-mono shadow-sm"
                        >
                          + Snap Photo
                        </button>
                      </div>

                      {isDvirCertified ? (
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-center space-y-1">
                          <div className="font-black text-xs font-mono flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>YARD CLEARANCE CERTIFIED</span>
                          </div>
                          <div className="text-[10px] font-mono">Cert #YCC-2026-9042 · Authorized for Highway Departure</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsDvirCertified(true)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 font-mono transition-all"
                        >
                          Certify Lash-Down & Sign Clearance ➔
                        </button>
                      )}
                    </div>
                  )}

                  {/* Electronic Proof of Delivery (ePOD) - Photo-First */}
                  {tripSubTab === 'EPOD' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-600 font-bold uppercase">
                        <span>📸 Photo Proof of Delivery (ePOD)</span>
                        <span className="text-emerald-600 font-bold">Field Standard</span>
                      </div>

                      {/* Photo 1: Stamped DO */}
                      <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-900 space-y-1.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200">1. Stamped Paper Delivery Note (DO)</span>
                          <span className="text-[8px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">ATTACHED</span>
                        </div>
                        <div className="border border-dashed border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-950 p-2 rounded text-center relative overflow-hidden">
                          <div className="text-[8.5px] font-mono font-bold text-slate-800 dark:text-slate-200">AL NABOODAH CONTRACTING LLC</div>
                          <div className="text-[7.5px] text-slate-400 font-mono">SITE DELIVERY RECEIPT #DO-2026-9941</div>
                          <div className="my-1 py-0.5 px-2 border-2 border-dashed border-rose-600 text-rose-600 font-black text-[8px] inline-block -rotate-2 rounded">
                            ★ RECEIVED & STAMPED ★
                          </div>
                          <div className="text-[7.5px] font-mono text-slate-500">Site Engineer: {receiverName}</div>
                        </div>
                        <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400 pt-0.5">
                          <span>📍 24.5332° N, 54.4021° E</span>
                          <span className="text-emerald-600 font-bold">GPS Verified ✓</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => alert('📸 Photo clicked with GPS & timestamp watermark overlay.')}
                            className="py-1 px-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 shadow-xs"
                          >
                            <Camera className="w-3 h-3" />
                            Click Photo
                          </button>
                          <label className="py-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700 cursor-pointer">
                            <Upload className="w-3 h-3 text-blue-500" />
                            Attach File
                            <input type="file" accept="image/*" className="hidden" onChange={() => alert('Photo attached successfully.')} />
                          </label>
                        </div>
                      </div>

                      {/* Photo 2: Offloaded Cargo */}
                      <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200">2. Offloaded Equipment on Site</span>
                          <span className="text-[8px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">VERIFIED</span>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-800 h-14 rounded flex flex-col items-center justify-center text-center p-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🚜 Equipment Placed at Project Site</span>
                          <span className="text-[7.5px] font-mono text-emerald-600 font-bold">Zero Mechanical Damage</span>
                        </div>
                      </div>

                      {/* Receiver inputs */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div>
                          <label className="text-[8.5px] font-mono text-slate-400 block">{t.receiver}</label>
                          <input 
                            type="text" 
                            value={receiverName}
                            onChange={e => setReceiverName(e.target.value)}
                            className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-mono text-slate-400 block">{t.designation}</label>
                          <input 
                            type="text" 
                            value={receiverRole}
                            onChange={e => setReceiverRole(e.target.value)}
                            className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEpodSubmitted(true);
                          updateStage('DELIVERED');
                          alert('✅ Stamped Delivery Note photo & GPS watermark confirmed! ePOD synced.');
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{epodSubmitted ? '✓ Stamped ePOD Dispatched' : 'SUBMIT STAMPED ePOD & DELIVER'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 2: DRIVER CALENDAR & SCHEDULE MATRIX */}
              {/* =================================================== */}
              {mainNav === 'CALENDAR' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-xs">DRIVER AGENDA</div>
                      <div className="text-[9px] font-mono text-slate-400">November 2026 Schedule</div>
                    </div>
                    <button
                      onClick={() => setShowBlockModal(true)}
                      className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t.blockSlot}</span>
                    </button>
                  </div>

                  {/* Schedule Cards List */}
                  <div className="space-y-2">
                    {schedules.map(item => {
                      const isTrip = item.type === 'TRIP_BOOKED';
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border text-xs space-y-1 transition-colors ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                          } ${isTrip ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-slate-400'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400">{item.date} • {item.timeWindow}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                              isTrip 
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.typeName}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                            {item.title}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-500">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 3: EARNINGS & SETTLEMENTS LEDGER */}
              {/* =================================================== */}
              {mainNav === 'EARNINGS' && (
                <div className="space-y-2.5">
                  {/* Summary Card */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md space-y-1">
                    <div className="text-[9px] font-mono uppercase font-bold tracking-wider opacity-80">
                      {t.earnedThisWeek}
                    </div>
                    <div className="text-xl font-black font-mono">
                      AED {totalEarnedAED.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/10 font-medium">
                      <span>Pending: AED {pendingAED.toLocaleString()}</span>
                      <span className="bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold">IBAN Validated</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Itemized Trip Pay Slips
                  </div>

                  {/* Trip Pay Items */}
                  <div className="space-y-2">
                    {earningsList.map(rec => (
                      <div
                        key={rec.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-[10px] text-slate-900 dark:text-white">
                            {rec.tripCode} ({rec.poNumber})
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            rec.status === 'DISBURSED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : rec.status === 'APPROVED'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}>
                            {rec.status}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {rec.cargoTitle}
                        </div>

                        {/* Breakdown */}
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[9px] font-mono space-y-0.5">
                          <div className="flex justify-between text-slate-500">
                            <span>Base Rate:</span>
                            <span>AED {rec.baseFareAED}</span>
                          </div>
                          {rec.demurrageTotalAED > 0 && (
                            <div className="flex justify-between text-amber-600 font-bold">
                              <span>Waiting Demurrage ({rec.waitingHours}h):</span>
                              <span>+ AED {rec.demurrageTotalAED}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-500">
                            <span>Salik / Darb Tolls:</span>
                            <span>+ AED {rec.salikTollsAED}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span>Total Payout:</span>
                            <span className="text-emerald-600 font-black">AED {rec.totalPayoutAED}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* TAB 4: PROFILE, LICENSES & UAE GATE PASSES */}
              {/* =================================================== */}
              {mainNav === 'DOCS' && (
                <div className="space-y-2.5">
                  {/* Digital Heavy Driver License Card */}
                  <div className={`p-3 rounded-2xl border space-y-2 transition-colors ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                          {trip.driverName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-xs">{trip.driverName}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{trip.driverPhone}</div>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold font-mono px-2 py-0.5 rounded">
                        VERIFIED
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">LICENSE NO:</span>
                        <strong>DXB-HV-99214</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CATEGORY:</span>
                        <strong>Heavy Articulated Trailer</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AUTHORITY:</span>
                        <strong>RTA Dubai</strong>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>VALIDITY:</span>
                        <span>Aug 2027 (Active)</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Vehicle & Mulkiya */}
                  <div className={`p-2.5 rounded-xl border space-y-1 text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="text-[9px] font-mono font-bold text-slate-400">ASSIGNED VEHICLE & MULKIYA</div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{trip.vehiclePlate}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Payload: 40.0T</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{trip.vehicleType}</div>
                  </div>

                  {/* Active UAE Gate Passes */}
                  <div className={`p-2.5 rounded-xl border space-y-1.5 text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="text-[9px] font-mono font-bold text-slate-400">SITE SECURITY GATE PASSES</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
                        🛡️ CICPA Abu Dhabi Oilfields
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold font-mono">
                        ⚓ JAFZA Freezone Pass
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* iOS Bottom Home Bar */}
            <div className="py-1 flex justify-center z-30">
              <div className="w-28 h-1 bg-slate-400/80 rounded-full"></div>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DRIVER SELF-SERVICE TIME BLOCK MODAL */}
      {/* ======================================================== */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-sm w-full rounded-3xl p-5 shadow-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm">Declare Off-Duty / Block Out Time</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddScheduleBlock} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-500">Date to Block *</label>
                <input 
                  type="date" 
                  value={newBlockDate}
                  onChange={e => setNewBlockDate(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-500">Block Reason *</label>
                <select
                  value={newBlockType}
                  onChange={e => setNewBlockType(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="MAINTENANCE">Scheduled Vehicle Maintenance</option>
                  <option value="REST_PERIOD">Mandatory Rest (Fatigue Compliance)</option>
                  <option value="PERSONAL_LEAVE">Personal Leave / Off-Duty</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-500">Notes / Workshop Location</label>
                <input 
                  type="text" 
                  value={newBlockNotes}
                  onChange={e => setNewBlockNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Dispatch Modal Simulation */}
      <WhatsAppDispatchModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        tripCode={trip.id}
        driverName={trip.driverName}
        driverPhone={trip.driverPhone}
        cargoDescription={trip.cargoDescription}
        originName={trip.originName}
        destinationName={trip.destinationName}
        trackingToken={trip.trackingToken}
        etaMinutes={trip.etaMinutes}
        theme={theme}
      />
    </div>
  );
}
