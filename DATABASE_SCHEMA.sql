-- ============================================================================
-- KASPER TELEMETRICS & DRIVER DISPATCH ECOSYSTEM
-- Standalone Database Schema (PostgreSQL 16+)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables cleanly if resetting
DROP TABLE IF EXISTS epod_signatures CASCADE;
DROP TABLE IF EXISTS inspection_photos CASCADE;
DROP TABLE IF EXISTS telemetry_breadcrumbs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS driver_devices CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. ADMIN & OPS USERS
-- ----------------------------------------------------------------------------
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ops_controller', -- 'admin', 'ops_controller', 'viewer'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. DRIVERS DIRECTORY
-- ----------------------------------------------------------------------------
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. +971501234567
    full_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(50),
    assigned_vehicle_plate VARCHAR(50), -- e.g. DXB-T-49102
    vehicle_category VARCHAR(100) DEFAULT 'Flatbed Heavy Transport',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'ar', 'ur'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_phone ON drivers(phone_number);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ----------------------------------------------------------------------------
-- 3. DRIVER ENROLLED DEVICES (For Push Notifications & Hardware Health)
-- ----------------------------------------------------------------------------
CREATE TABLE driver_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL, -- Expo push token or FCM token
    platform VARCHAR(20) NOT NULL, -- 'android' or 'ios'
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_driver_device UNIQUE (driver_id, device_token)
);

-- ----------------------------------------------------------------------------
-- 4. TRIPS & DISPATCH CARDS
-- ----------------------------------------------------------------------------
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_code VARCHAR(30) UNIQUE NOT NULL, -- Human-readable: KSP-TR-2041
    status VARCHAR(40) NOT NULL DEFAULT 'DRAFT', 
    -- 'DRAFT', 'ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION', 'COMPLETED', 'CANCELLED'
    
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    
    -- Cargo Specs
    cargo_title VARCHAR(255) NOT NULL,
    cargo_weight_tons NUMERIC(8, 2),
    cargo_category VARCHAR(100),
    cargo_notes TEXT,
    
    -- Origin / Loading Location
    origin_address TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lon DOUBLE PRECISION NOT NULL,
    origin_contact_name VARCHAR(150),
    origin_contact_phone VARCHAR(30),
    origin_geofence_radius_meters INT DEFAULT 300,
    
    -- Destination / Drop-off Location
    destination_address TEXT NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lon DOUBLE PRECISION NOT NULL,
    destination_contact_name VARCHAR(150),
    destination_contact_phone VARCHAR(30),
    destination_geofence_radius_meters INT DEFAULT 300,
    
    -- Customer & Commercial Specs
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),
    
    -- Customer Tracking Link Token (32-character random string)
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    tracking_link_expires_at TIMESTAMPTZ,
    
    -- Timestamps for Lifecycle Audit
    scheduled_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    en_route_pickup_at TIMESTAMPTZ,
    at_pickup_at TIMESTAMPTZ,
    in_transit_at TIMESTAMPTZ,
    at_destination_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_driver_status ON trips(driver_id, status);
CREATE INDEX idx_trips_tracking_token ON trips(tracking_token);
CREATE INDEX idx_trips_status ON trips(status);

-- ----------------------------------------------------------------------------
-- 5. TELEMETRY BREADCRUMBS (High-Frequency Location Stream)
-- ----------------------------------------------------------------------------
CREATE TABLE telemetry_breadcrumbs (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    bearing NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    accuracy_meters NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    altitude_meters NUMERIC(7, 2),
    battery_percentage INT,
    
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize for fast query of recent position and historical trails
CREATE INDEX idx_breadcrumbs_trip_time ON telemetry_breadcrumbs(trip_id, recorded_at DESC);
CREATE INDEX idx_breadcrumbs_driver_time ON telemetry_breadcrumbs(driver_id, recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 6. INSPECTION PHOTOS (Pre-Trip & Post-Trip)
-- ----------------------------------------------------------------------------
CREATE TABLE inspection_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    photo_phase VARCHAR(30) NOT NULL, -- 'PRE_TRIP' or 'POST_TRIP'
    image_url TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_trip ON inspection_photos(trip_id, photo_phase);

-- ----------------------------------------------------------------------------
-- 7. ELECTRONIC PROOF OF DELIVERY (ePOD)
-- ----------------------------------------------------------------------------
CREATE TABLE epod_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(30) NOT NULL,
    receiver_designation VARCHAR(100),
    signature_image_url TEXT NOT NULL, -- S3 URL of signed canvas PNG
    
    signoff_latitude DOUBLE PRECISION,
    signoff_longitude DOUBLE PRECISION,
    remarks TEXT,
    
    generated_pdf_url TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. REAL-TIME FLEET VIEW (Fast Materialized State for Dashboard)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_fleet_status AS
SELECT DISTINCT ON (t.driver_id)
    t.id AS trip_id,
    t.trip_code,
    t.status AS trip_status,
    t.cargo_title,
    t.customer_name,
    t.tracking_token,
    d.id AS driver_id,
    d.full_name AS driver_name,
    d.phone_number AS driver_phone,
    d.assigned_vehicle_plate,
    b.latitude,
    b.longitude,
    b.speed_kmh,
    b.bearing,
    b.battery_percentage,
    b.recorded_at AS last_ping_time,
    EXTRACT(EPOCH FROM (NOW() - b.recorded_at)) AS seconds_since_last_ping,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - b.recorded_at)) < 90 THEN 'LIVE'
        WHEN EXTRACT(EPOCH FROM (NOW() - b.recorded_at)) < 300 THEN 'DELAYED'
        ELSE 'OFFLINE'
    END AS connection_health
FROM trips t
JOIN drivers d ON t.driver_id = d.id
LEFT JOIN telemetry_breadcrumbs b ON b.trip_id = t.id
WHERE t.status IN ('ASSIGNED', 'EN_ROUTE_PICKUP', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DESTINATION')
ORDER BY t.driver_id, b.recorded_at DESC;

-- ----------------------------------------------------------------------------
-- 9. SEED DATA (Ready for Immediate Testing)
-- ----------------------------------------------------------------------------
INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES ('admin@kasper.ae', crypt('Admin@Kasper2026', gen_salt('bf')), 'Master Dispatcher', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO drivers (id, phone_number, full_name, license_number, assigned_vehicle_plate, vehicle_category, status)
VALUES 
    ('44444444-4444-4444-4444-444444444441', '+971501112233', 'Rashid Khan', 'DXB-HV-9921', 'DXB-T-49102', 'Lowbed 60-Ton', 'ON_TRIP'),
    ('44444444-4444-4444-4444-444444444442', '+971502223344', 'Tariq Mehmood', 'AUH-HV-8812', 'AUH-T-12891', 'Flatbed 40-Ft', 'AVAILABLE'),
    ('44444444-4444-4444-4444-444444444443', '+971503334455', 'Sajid Ali', 'SHJ-HV-7731', 'SHJ-T-55194', 'Boom Truck 10-Ton', 'AVAILABLE')
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO trips (
    id, trip_code, status, driver_id, cargo_title, cargo_weight_tons, cargo_category,
    origin_address, origin_lat, origin_lon, origin_contact_name, origin_contact_phone,
    destination_address, destination_lat, destination_lon, destination_contact_name, destination_contact_phone,
    customer_name, customer_phone, tracking_token
) VALUES (
    '55555555-5555-5555-5555-555555555551',
    'KSP-TR-2041',
    'IN_TRANSIT',
    '44444444-4444-4444-4444-444444444441',
    'Caterpillar 320D Excavator',
    21.50,
    'Heavy Machinery',
    'Jebel Ali Industrial 1, Yard 4B, Dubai',
    24.9924,
    55.0931,
    'Bilal Storekeeper',
    '+971509988776',
    'Dubai South Construction Gate 4, Dubai',
    24.8912,
    55.1432,
    'Eng. Farhan',
    '+971504433221',
    'Al Naboodah Contracting LLC',
    '+971505544332',
    '8f92a1c0d4e740b2a3f912cd4e019a82'
) ON CONFLICT (trip_code) DO NOTHING;

-- Seed recent telemetry trail for demonstration
INSERT INTO telemetry_breadcrumbs (trip_id, driver_id, latitude, longitude, speed_kmh, bearing, accuracy_meters, battery_percentage, recorded_at)
VALUES 
    ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 24.9924, 55.0931, 0.0, 0.0, 3.2, 85, NOW() - INTERVAL '15 minutes'),
    ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 24.9810, 55.1012, 52.4, 155.0, 4.0, 84, NOW() - INTERVAL '10 minutes'),
    ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 24.9652, 55.1145, 64.1, 162.0, 3.8, 83, NOW() - INTERVAL '5 minutes'),
    ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 24.9412, 55.1280, 58.7, 168.0, 4.1, 82, NOW() - INTERVAL '30 seconds');
