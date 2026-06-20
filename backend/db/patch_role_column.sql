-- Patch script to ensure the 'role' column exists in the 'users' table.
-- Using DO block for idempotent execution in PostgreSQL.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(255) DEFAULT 'customer';
    END IF;
END$$;
