-- Create provider_profiles table to support strict provider filtering
CREATE TABLE IF NOT EXISTS provider_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Backfill provider_profiles for existing providers
INSERT INTO provider_profiles (user_id)
SELECT id FROM users
WHERE role = 'provider'::account_role
   OR (role = 'mixed'::account_role AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = users.id AND role_name = 'provider'::account_role))
ON CONFLICT (user_id) DO NOTHING;
