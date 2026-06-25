-- Add 'mixed' role to account_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'account_role' AND e.enumlabel = 'mixed') THEN
        ALTER TYPE account_role ADD VALUE 'mixed';
    END IF;
END$$;
