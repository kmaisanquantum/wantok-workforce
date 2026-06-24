-- 1. Backfill user_roles from the primary users.role column if missing
-- We use a CASE statement and WHERE filters to safely handle corrupted data
-- filtering out 'null', 'undefined', and empty strings to prevent Enum cast failures.
INSERT INTO user_roles (user_id, role_name)
SELECT id, role
FROM users
WHERE role IS NOT NULL
  AND role::TEXT NOT IN ('null', 'undefined', '')
  AND id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role_name) DO NOTHING;

-- 2. Cleanup user_roles table for any previously leaked invalid role strings
-- We cast to TEXT first to safely compare against invalid literals
DELETE FROM user_roles
WHERE role_name::TEXT IS NULL
   OR role_name::TEXT IN ('null', 'undefined', '');
