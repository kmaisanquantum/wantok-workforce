-- Seed mock bookings for stats
INSERT INTO users (name, phone_number, email, password_hash, role, active_persona)
VALUES ('Mock Customer', '000000', 'mock_cust@example.com', 'hash', 'customer', 'customer')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_name)
SELECT id, 'customer' FROM users WHERE email = 'mock_cust@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO users (name, phone_number, email, password_hash, role, active_persona, is_verified)
VALUES ('Mock Provider', '111111', 'mock_prov@example.com', 'hash', 'provider', 'provider', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_name)
SELECT id, 'provider' FROM users WHERE email = 'mock_prov@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_id, provider_id, service_type, status)
SELECT c.id, p.id, 'Electrical', 'completed'
FROM users c, users p
WHERE c.email = 'mock_cust@example.com' AND p.email = 'mock_prov@example.com'
LIMIT 5;
