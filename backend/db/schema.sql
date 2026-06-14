-- PostgreSQL / PostGIS Schema for Wantok Workforce Auth System

BEGIN;

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create role enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_role') THEN
        CREATE TYPE account_role AS ENUM ('customer', 'provider', 'admin');
    END IF;
END$$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    active_persona account_role, -- The current active persona context

    -- Location handling via PostGIS
    location_coords GEOGRAPHY(POINT, 4326),
    location_name TEXT, -- Human readable location/district

    -- Provider-specific nullable fields
    primary_skill TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Establish a multi-role mapping table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name account_role NOT NULL,
    PRIMARY KEY (user_id, role_name)
);

-- Index for geo-spatial searches
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location_coords);

COMMIT;
