-- Seed Master Administrator Credentials
INSERT INTO users (name, phone_number, email, password_hash, role, active_persona, is_available)
VALUES ('Master Admin', '0000000000', 'admin@dspng.tech', '$2b$12$5uLOpMJEX0ee4jPCfoxGEuLGEZE1SovR.MiBPZ6PUUyRzHYdusJn.', 'admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Map the admin role to the master user
INSERT INTO user_roles (user_id, role_name)
SELECT id, 'admin' FROM users WHERE email = 'admin@dspng.tech'
ON CONFLICT DO NOTHING;
