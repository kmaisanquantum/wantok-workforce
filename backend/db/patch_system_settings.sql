-- Create settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default settings
INSERT INTO system_settings (key, value) VALUES
('match_radius', '50'),
('platform_fee', '10.00'),
('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;
