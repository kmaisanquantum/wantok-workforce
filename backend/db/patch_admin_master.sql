-- Migration: Add status and balance to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing users to have 'active' status if null
UPDATE users SET status = 'active' WHERE status IS NULL;
