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

    role account_role NOT NULL DEFAULT 'customer',
    active_persona account_role,

    -- Availability for providers
    is_available BOOLEAN DEFAULT TRUE,

    -- Location handling via PostGIS
    location_coords GEOGRAPHY(POINT, 4326),
    location_name TEXT,

    -- Provider-specific nullable fields
    primary_skill TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure column is_available exists if table was created previously without it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_available') THEN
        ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
    END IF;
END$$;

-- Establish a multi-role mapping table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name account_role NOT NULL,
    PRIMARY KEY (user_id, role_name)
);

-- Index for geo-spatial searches
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location_coords);

COMMIT;
