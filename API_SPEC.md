# API Specification: Kasper Telemetry & Dispatch Gateway
## Version: 1.0.0
**Base URL:** `https://api-telematics.kasperpro.com`  
**Protocol:** HTTPS / TLS 1.3 & WSS (WebSocket)  
**Content-Type:** `application/json`  

---

## 1. Authentication & Security

All protected endpoints require a Bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```

### JWT Claims Structure:
- Driver Token: `{ "sub": "drv_01J...", "role": "driver", "phone": "+971501234567" }`
- Ops Admin Token: `{ "sub": "usr_01J...", "role": "ops_admin", "email": "ops@kasper.ae" }`

---

## 2. Driver Mobile Endpoints

### 2.1 Request Driver OTP
Generates a 6-digit numeric verification code sent via SMS/WhatsApp.

- **`POST /api/v1/driver/auth/request-otp`**
- **Auth Required:** No

#### Request:
```json
{
  "phoneNumber": "+971501234567"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Verification code dispatched",
  "expiresInSeconds": 300
}
```

---

### 2.2 Verify Driver OTP
Validates the SMS/WhatsApp OTP and returns access token.

- **`POST /api/v1/driver/auth/verify-otp`**
- **Auth Required:** No

#### Request:
```json
{
  "phoneNumber": "+971501234567",
  "otp": "492810",
  "deviceInfo": {
    "platform": "android",
    "model": "Samsung Galaxy A54",
    "osVersion": "14.0",
    "appVersion": "1.0.0"
  }
}
```

#### Response (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "driver": {
    "id": "drv_01HQE4V7P...",
    "fullName": "Rashid Khan",
    "phone": "+971501234567",
    "status": "AVAILABLE",
    "assignedVehiclePlate": "DXB-T-49102"
  }
}
```

---

### 2.3 Fetch Assigned Trips
Retrieves the driver's current active trip or assigned queue.

- **`POST /api/v1/driver/trips/active`** (or `GET /api/v1/driver/trips/active`)
- **Auth Required:** Yes (`role: driver`)

#### Response (200 OK):
```json
{
  "activeTrip": {
    "id": "trp_01HQE9X8Z...",
    "tripCode": "KSP-TR-2041",
    "status": "ASSIGNED",
    "cargo": {
      "title": "CAT 320D Excavator",
      "weightTons": 21.5,
      "category": "Heavy Plant",
      "notes": "Bring 4 heavy-duty binder chains."
    },
    "origin": {
      "address": "Jebel Ali Industrial Area 1, Dubai",
      "latitude": 24.9924,
      "longitude": 55.0931,
      "contactName": "Bilal Warehouse Mgr",
      "contactPhone": "+971509988776"
    },
    "destination": {
      "address": "Dubai South Construction Gate 4, Dubai",
      "latitude": 24.8912,
      "longitude": 55.1432,
      "contactName": "Eng. Farhan",
      "contactPhone": "+971504433221"
    },
    "customer": {
      "companyName": "Arabian Contracting Co."
    },
    "scheduledPickupTime": "2026-11-03T08:00:00Z"
  }
}
```

---

### 2.4 Update Trip Status
Transitions the trip state machine.

- **`POST /api/v1/driver/trips/:tripId/status`**
- **Auth Required:** Yes (`role: driver`)

#### Request:
```json
{
  "status": "EN_ROUTE_PICKUP",
  "latitude": 24.9921,
  "longitude": 55.0928,
  "remarks": "Leaving staging yard now."
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "tripId": "trp_01HQE9X8Z...",
  "currentStatus": "EN_ROUTE_PICKUP",
  "updatedAt": "2026-11-02T15:20:00Z"
}
```

---

### 2.5 Ingest Telemetry Batch
Uploads a batch of buffered location breadcrumbs.

- **`POST /api/v1/driver/telemetry/batch`**
- **Auth Required:** Yes (`role: driver`)

#### Request:
```json
{
  "tripId": "trp_01HQE9X8Z...",
  "batteryPercentage": 82,
  "isCharging": true,
  "samples": [
    {
      "latitude": 24.9910,
      "longitude": 55.0940,
      "speedKmh": 54.2,
      "bearing": 178.5,
      "accuracyMeters": 4.1,
      "altitudeMeters": 12.0,
      "recordedAt": 1730556015000
    },
    {
      "latitude": 24.9895,
      "longitude": 55.0942,
      "speedKmh": 56.8,
      "bearing": 180.0,
      "accuracyMeters": 3.8,
      "altitudeMeters": 12.2,
      "recordedAt": 1730556030000
    }
  ]
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "processedPoints": 2,
  "serverTimestamp": 1730556035000
}
```

---

### 2.6 Submit ePOD & Inspection
Submits digital delivery signoff, signatures, and inspection photos.

- **`POST /api/v1/driver/trips/:tripId/epod`**
- **Auth Required:** Yes (`role: driver`)

#### Request (Multipart or JSON with S3 keys):
```json
{
  "receiverName": "Farhan Al Hashimi",
  "receiverPhone": "+971504433221",
  "receiverDesignation": "Site Logistics Lead",
  "signatureImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "inspectionPhotos": [
    {
      "phase": "PRE_TRIP",
      "url": "https://s3.kasper.ae/inspections/trp_01/pre_01.jpg",
      "notes": "Tie down chains tensioned"
    },
    {
      "phase": "POST_TRIP",
      "url": "https://s3.kasper.ae/inspections/trp_01/post_01.jpg",
      "notes": "Excavator unloaded at Pad B"
    }
  ],
  "remarks": "Received in good order without incident."
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "tripId": "trp_01HQE9X8Z...",
  "status": "COMPLETED",
  "consignmentNotePdfUrl": "https://s3.kasper.ae/epod-vault/KSP-TR-2041-ePOD.pdf"
}
```

---

## 3. Standalone Ops Admin Endpoints

### 3.1 List / Create Trips
- **`GET /api/v1/ops/trips?status=ACTIVE&page=1&limit=20`**
- **`POST /api/v1/ops/trips`**
- **Auth Required:** Yes (`role: ops_admin`)

#### Create Trip Request:
```json
{
  "customerName": "Al Naboodah Construction",
  "customerPhone": "+971505544332",
  "cargoTitle": "Komatsu WA470 Wheel Loader",
  "cargoWeightTons": 24.0,
  "cargoCategory": "Heavy Plant",
  "originAddress": "Al Quoz Industrial 3, Dubai",
  "originLat": 25.1321,
  "originLon": 55.2341,
  "originContactName": "Youssef",
  "originContactPhone": "+971501112233",
  "destinationAddress": "Abu Dhabi Port (Khalifa Port), Abu Dhabi",
  "destinationLat": 24.8421,
  "destinationLon": 54.6541,
  "destinationContactName": "Sultan",
  "destinationContactPhone": "+971508889900",
  "driverId": "drv_01HQE4V7P...",
  "scheduledAt": "2026-11-03T09:00:00Z"
}
```

---

### 3.2 Live Fleet Coordinates (Snapshot)
Returns the latest position of all active trucks.

- **`GET /api/v1/ops/fleet/live-positions`**
- **Auth Required:** Yes (`role: ops_admin`)

#### Response (200 OK):
```json
{
  "fleet": [
    {
      "driverId": "drv_01HQE4V7P...",
      "driverName": "Rashid Khan",
      "driverPhone": "+971501234567",
      "vehiclePlate": "DXB-T-49102",
      "tripId": "trp_01HQE9X8Z...",
      "tripCode": "KSP-TR-2041",
      "tripStatus": "IN_TRANSIT",
      "lat": 24.9895,
      "lon": 55.0942,
      "speedKmh": 56.8,
      "bearing": 180.0,
      "batteryPercentage": 82,
      "lastPingAgeSeconds": 14,
      "health": "LIVE"
    }
  ]
}
```

---

### 3.3 Historical Route Trail
Fetches full coordinates list for path replay.

- **`GET /api/v1/ops/trips/:tripId/route-trail`**
- **Auth Required:** Yes (`role: ops_admin`)

#### Response (200 OK):
```json
{
  "tripId": "trp_01HQE9X8Z...",
  "totalPoints": 348,
  "coordinates": [
    [24.9924, 55.0931, 0, 1730555000000],
    [24.9910, 55.0940, 54.2, 1730556015000],
    [24.9895, 55.0942, 56.8, 1730556030000]
  ]
}
```

---

## 4. Customer Public Live Tracking Endpoint

### 4.1 Get Public Trip Tracking Details
Publicly accessible via cryptographically secure 32-character token.

- **`GET /api/v1/public/track/:trackingToken`**
- **Auth Required:** No

#### Response (200 OK):
```json
{
  "trackingToken": "8f92a1c0d4e740b2a3f912cd4e019a82",
  "tripCode": "KSP-TR-2041",
  "status": "IN_TRANSIT",
  "statusLabel": "En Route to Site",
  "cargo": {
    "title": "CAT 320D Excavator",
    "category": "Heavy Equipment Transport"
  },
  "origin": {
    "address": "Jebel Ali Industrial Area 1"
  },
  "destination": {
    "address": "Dubai South Construction Gate 4",
    "latitude": 24.8912,
    "longitude": 55.1432
  },
  "livePosition": {
    "latitude": 24.9521,
    "longitude": 55.1189,
    "speedKmh": 58.0,
    "bearing": 172.0,
    "updatedAt": "2026-11-02T15:24:12Z"
  },
  "eta": {
    "remainingDistanceKm": 8.4,
    "estimatedDurationMinutes": 12,
    "estimatedArrival": "2026-11-02T15:36:00Z"
  },
  "supportContact": {
    "phone": "+9714800KASPER",
    "whatsapp": "+971501112233"
  }
}
```

---

## 5. Real-Time WebSocket Specifications

### Connection URL:
`wss://api-telematics.kasperpro.com/ws/ops`  
**Header:** `Authorization: Bearer <ADMIN_JWT>`

### Server Events Emitted to Admin:

#### 1. `TRIP_LOCATION_UPDATE`
```json
{
  "event": "TRIP_LOCATION_UPDATE",
  "data": {
    "tripId": "trp_01HQE9X8Z...",
    "driverId": "drv_01HQE4V7P...",
    "lat": 24.9521,
    "lon": 55.1189,
    "speedKmh": 58.0,
    "bearing": 172.0,
    "timestamp": 1730556252000
  }
}
```

#### 2. `TRIP_STATUS_CHANGE`
```json
{
  "event": "TRIP_STATUS_CHANGE",
  "data": {
    "tripId": "trp_01HQE9X8Z...",
    "previousStatus": "IN_TRANSIT",
    "newStatus": "AT_DESTINATION",
    "timestamp": 1730557000000
  }
}
```

#### 3. `EPOD_SUBMITTED`
```json
{
  "event": "EPOD_SUBMITTED",
  "data": {
    "tripId": "trp_01HQE9X8Z...",
    "receiverName": "Farhan Al Hashimi",
    "pdfUrl": "https://s3.kasper.ae/epod-vault/KSP-TR-2041-ePOD.pdf",
    "timestamp": 1730557500000
  }
}
```
