'use client';

import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, Share2, Smartphone, ShieldCheck } from './Icons';

interface WhatsAppDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripCode?: string;
  driverName?: string;
  driverPhone?: string;
  cargoDescription?: string;
  originName?: string;
  destinationName?: string;
  trackingToken?: string;
  etaMinutes?: number;
  theme?: 'light' | 'dark';
}

export default function WhatsAppDispatchModal({
  isOpen,
  onClose,
  tripCode = 'KSP-EQ-101',
  driverName = 'Rashid Khan',
  driverPhone = '+971 50 111 2233',
  cargoDescription = 'CAT 320D Hydraulic Excavator',
  originName = 'Dubai South Logistics City, Yard 7',
  destinationName = 'Abu Dhabi Saadiyat Cultural District (Louvre Phase 2)',
  trackingToken = '8f92a1c0d4e740b2a3f912cd4e019a82',
  etaMinutes = 42,
  theme = 'light'
}: WhatsAppDispatchModalProps) {
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const [recipientType, setRecipientType] = useState<'DRIVER' | 'CONSIGNEE'>('CONSIGNEE');
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const consigneeMessage = `🚨 *KASPER FREIGHT DISPATCH ALERT* 🚨
━━━━━━━━━━━━━━━━━━━━━
📦 *Consignment:* ${cargoDescription}
🆔 *Trip Code:* ${tripCode}
👤 *Transporter Driver:* ${driverName} (${driverPhone})
📍 *Origin:* ${originName}
🏁 *Destination Site:* ${destinationName}
🕒 *Live Dynamic ETA:* ~${etaMinutes} mins remaining

🔗 *Live Heavy Equipment GPS Tracking:*
https://track.kasperpro.com/t/${trackingToken}

_Zero login required. Powered by Kasper Trip-Gated Telematics._
━━━━━━━━━━━━━━━━━━━━━`;

  const driverMessage = `🚛 *KASPER DRIVER DISPATCH NOTICE* 🚛
━━━━━━━━━━━━━━━━━━━━━
Assigned Trip: *${tripCode}*
Cargo: *${cargoDescription}*
Pickup Yard: *${originName}*
Delivery Site: *${destinationName}*

📲 *Open Driver App & Start GPS:*
https://kasperpro.com/driver?trip=${tripCode}

_Remember: Pre-trip equipment lash-down verification is mandatory prior to departure._
━━━━━━━━━━━━━━━━━━━━━`;

  const activeMessage = recipientType === 'CONSIGNEE' ? consigneeMessage : driverMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setDispatched(true);
    setTimeout(() => {
      alert(`✓ WhatsApp Cloud API Webhook Triggered!\nMessage successfully delivered to ${recipientType === 'CONSIGNEE' ? 'Site Engineer (+971 52 984 5512)' : driverPhone}.`);
      setDispatched(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base">WhatsApp Automated Dispatch Gateway</h3>
              <p className="text-[11px] text-slate-500 font-mono">GCC Direct Messaging Layer (Zero-App Consignee Tracking)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Recipient Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecipientType('CONSIGNEE')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all ${
              recipientType === 'CONSIGNEE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Site Consignee (Live Tracking Link)
          </button>
          <button
            onClick={() => setRecipientType('DRIVER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all ${
              recipientType === 'DRIVER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Driver (Trip Assignment & Launch)
          </button>
        </div>

        {/* Realistic WhatsApp Chat Bubble Container */}
        <div className="rounded-2xl p-4 bg-[#e5ddd5] dark:bg-[#0b141a] border border-slate-300 dark:border-slate-800 font-sans shadow-inner">
          <div className="max-w-[90%] bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-none shadow-md text-xs space-y-2">
            <div className="whitespace-pre-line font-mono text-[11px] leading-relaxed">
              {activeMessage}
            </div>
            <div className="text-[9px] text-slate-400 text-right font-mono flex items-center justify-end gap-1">
              <span>11:42 AM</span>
              <span className="text-blue-500 font-bold">✓✓</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? '✓ Copied to Clipboard' : 'Copy Message Text'}</span>
          </button>

          <button
            onClick={handleSimulateSend}
            disabled={dispatched}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{dispatched ? 'Dispatching...' : 'Simulate WhatsApp Push ➔'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
