# AGENTS.md & CLAUDE.md: Kasper Driver Ecosystem Guidelines

This repository represents the **standalone Kasper Driver & Dispatch Tracking Ecosystem**. It is independent of legacy marketplace backends and provides an end-to-end telemetry, dispatch, ePOD (electronic proof of delivery), and customer live-tracking system.

---

## 1. Ecosystem Overview

The ecosystem consists of four interconnected components:
1. **Driver Mobile App (`/apps/mobile-driver`)**: React Native / Expo application for field drivers (Android & iOS). Features background GPS, offline buffering, trip lifecycle transitions, and ePOD capture.
2. **Telemetry & Ingestion Server (`/services/telemetry-api`)**: Fast Node.js / Express backend with PostgreSQL & Redis/Memory adapters. Handles high-frequency location batches, trip state transitions, and media uploads.
3. **Standalone Ops & Dispatch Admin Portal (`/apps/ops-admin`)**: Modern web dashboard for dispatchers and ops controllers to create trips, assign drivers, monitor live fleet movements on Leaflet maps, inspect ePODs, and generate customer tracking links.
4. **Customer Live Tracking Web Surface (`/apps/customer-tracking`)**: Public, tokenized responsive tracking page (`/track/:token`) where end-clients track their truck in real time with live route, vehicle speed, and estimated arrival time (ETA).

---

## 2. Universal Technical Guidelines

- **Zero Coupling to Old Core**: Do not import or couple with `kasper-core` or legacy SQL Server marketplace databases. All data models are defined in `DATABASE_SCHEMA.sql`.
- **Offline First**: The mobile driver app must treat network loss as a normal operational state (common in remote UAE desert sites and port freezones). Every location breadcrumb and ePOD payload is written to local SQLite first.
- **Battery & Thermal Restraint**: Extreme heat in the UAE demands battery and CPU optimization. Location sampling must use adaptive intervals (10s in transit, 60s when stationary).
- **Driver Privacy**: GPS tracking is strictly **Trip-Gated**. Background geolocation services must ONLY run between `START_TRIP` and `COMPLETED_EPOD`.
- **Immutable Audit Trails**: Position logs, trip event logs, and signed ePODs cannot be updated or deleted once committed.

---

## 3. Directory Layout

```
kasper-driver-ecosystem/
├── apps/
│   ├── mobile-driver/          # Expo React Native mobile app (Android / iOS)
│   ├── ops-admin/              # Next.js / Tailwind / Leaflet Admin & Dispatch portal
│   └── customer-tracking/      # Lightweight Next.js / React client live tracking UI
├── services/
│   ├── telemetry-api/          # Node.js backend (Express / Fastify + pg)
│   └── docs/                   # API contracts and specifications
├── database/
│   └── schema.sql              # PostgreSQL schema with PostGIS and RLS support
├── CLAUDE.md                   # Agent and developer instructions (this file)
├── PRD.md                      # Product Requirements Document
├── ARCHITECTURE.md             # System architecture & data flow diagrams
├── MODULES.md                  # Comprehensive breakdown of all modules
├── API_SPEC.md                 # REST & WebSocket API specification
└── DATABASE_SCHEMA.sql         # Standalone PostgreSQL DDL
```

---

## 4. Tech Stack Standards

- **Mobile**: React Native (Expo SDK 52+), TypeScript, NativeWind v4 (Tailwind CSS), `expo-location`, `expo-task-manager`, `expo-sqlite`, `react-native-signature-canvas`, `lucide-react-native`.
- **Admin & Tracking Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Leaflet & `react-leaflet`, Zustand for client state.
- **Backend / Telemetry API**: Node.js 22+ (ESM), TypeScript or zero-build clean JS, PostgreSQL 16+ (with optional PostGIS), JWT for auth, WebSocket (WS or Socket.IO) for live streaming to admin.
- **Storage**: S3-compatible object store (MinIO or AWS S3) for ePOD photo inspections and signature captures.

---

## 5. Dev Commands & Environment

```bash
# Telemetry API
cd services/telemetry-api
npm install
npm run dev         # Starts on port 4000

# Ops Admin Portal
cd apps/ops-admin
npm install
npm run dev         # Starts on port 3000

# Mobile Driver App
cd apps/mobile-driver
npm install
npx expo start      # Starts Expo Metro bundler
```
