-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers Table
CREATE TYPE driver_status AS ENUM ('OFF_DUTY', 'AVAILABLE', 'ON_ROUTE');

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    status driver_status DEFAULT 'OFF_DUTY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries Table
CREATE TYPE delivery_status AS ENUM ('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    status delivery_status DEFAULT 'PENDING',
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    planned_eta TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    recipient_phone VARCHAR(50),
    tracking_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location Logs Table (Time-series data)
CREATE TABLE location_logs (
    id BIGSERIAL PRIMARY KEY,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying recent locations quickly
CREATE INDEX idx_location_logs_delivery_time ON location_logs (delivery_id, timestamp DESC);
CREATE INDEX idx_location_logs_driver_time ON location_logs (driver_id, timestamp DESC);

-- Driver Scorecards Table
CREATE TABLE driver_scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    hard_braking_count INTEGER DEFAULT 0,
    speeding_events_count INTEGER DEFAULT 0,
    overall_score DOUBLE PRECISION DEFAULT 100.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id, week_start_date)
);
