-- Initialize system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial parameters
INSERT INTO system_settings (key, value) VALUES
('maintenance_mode', 'false'),
('match_radius', '15'),
('platform_fee', '10')
ON CONFLICT (key) DO NOTHING;
