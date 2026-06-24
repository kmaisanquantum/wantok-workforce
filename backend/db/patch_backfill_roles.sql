-- 1. Backfill user_roles from the primary users.role column if missing
-- This ensures the 'roles' array returned by AuthController/AdminController is never empty
INSERT INTO user_roles (user_id, role_name)
SELECT id, role
FROM users
WHERE role IS NOT NULL
AND id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role_name) DO NOTHING;

-- 2. Cleanup any [null] or invalid strings that might have leaked into roles arrays previously
DELETE FROM user_roles WHERE role_name IS NULL OR role_name = 'null';

-- 3. Sync Redis counters if they are missing or inconsistent
-- This runs as part of the DB initialization to ensure the Admin Dashboard is populated on first load
-- Note: Actual sync happens in AdminController.getDashboardMetrics via self-healing,
-- but this SQL ensures the base data is clean.
