-- Script to create the Admin account for kmaisan@dspng.tech
-- Execute this against your production database

DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    -- 1. Insert the user if they don't already exist
    INSERT INTO users (name, phone_number, email, password_hash, active_persona)
    VALUES ('Admin User', '00000000', 'kmaisan@dspng.tech', '$2b$12$QWGbq427kswN9buYWo3Vq.DHDQ.gi5eNP.jAnxJG/WFU29RF/fqTe', 'admin')
    ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        active_persona = 'admin'
    RETURNING id INTO admin_id;

    -- 2. Ensure the user has the 'admin' role in the mapping table
    INSERT INTO user_roles (user_id, role_name)
    VALUES (admin_id, 'admin')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin user created/updated with ID %', admin_id;
END $$;
