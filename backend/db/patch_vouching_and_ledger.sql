-- Part A: Grassroots Vouching Table
CREATE TABLE IF NOT EXISTS community_verifications (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gatekeeper_name TEXT NOT NULL,
    gatekeeper_role TEXT NOT NULL,
    gatekeeper_contact TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update provider_profiles to include verification status and wallet
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS is_community_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS withdrawn_total DECIMAL(10, 2) DEFAULT 0.00;

-- Part B: 'De Facto' Employment Ledger - Feedback and completion metadata
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_rating INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_text TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Index for quick history retrieval
CREATE INDEX IF NOT EXISTS idx_bookings_provider_completed ON bookings(provider_id, status) WHERE status = 'completed';
