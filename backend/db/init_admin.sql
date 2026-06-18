INSERT INTO users (name, phone_number, email, password_hash, role, active_persona, is_available)
VALUES ('System Admin', '000', 'admin@wantok.com', '$2b$12$qPS/mPst7d9j.yNf0Ho.9.P.9JxBj9DUB45HoHxtIcCJjC2WjK.mS', 'admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_name)
SELECT id, 'admin' FROM users WHERE email = 'admin@wantok.com'
ON CONFLICT DO NOTHING;
