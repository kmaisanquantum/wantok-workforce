-- Initialize system-wide financial counters in system_settings
INSERT INTO system_settings (key, value, group_category) VALUES
('active_escrow_flow', '0.00', 'financial'),
('total_disbursements', '0.00', 'financial')
ON CONFLICT (key) DO NOTHING;

-- Update bookings status if necessary (using TEXT so we don't strictly need to change types, but let's ensure indices)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
