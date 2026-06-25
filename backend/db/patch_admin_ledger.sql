-- SaaS Arbitration & System Ledger Infrastructure
-- Objective: Support Performance Analytics and Automated Milestone Arbitration

DO $$
BEGIN
    -- 1. Add platform_fee column to track operational cuts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='platform_fee') THEN
        ALTER TABLE bookings ADD COLUMN platform_fee DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    -- 2. Add dispute_metadata for audit visibility (chat trails, proof of work)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='dispute_metadata') THEN
        ALTER TABLE bookings ADD COLUMN dispute_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 3. Add payout_status to track disbursement flow
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payout_status') THEN
        ALTER TABLE bookings ADD COLUMN payout_status TEXT DEFAULT 'pending'; -- 'pending', 'escrowed', 'disbursed', 'refunded'
    END IF;
END$$;

-- Ensure some existing data reflects the new system for testing
UPDATE bookings SET payout_status = 'disbursed' WHERE status = 'completed' AND payout_status = 'pending';
UPDATE bookings SET payout_status = 'escrowed' WHERE status IN ('pending', 'confirmed') AND payout_status = 'pending';
