-- Extend system_settings with group_category
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS group_category VARCHAR(100) DEFAULT 'general';

-- Update existing settings categories
UPDATE system_settings SET group_category = 'engine' WHERE key IN ('match_radius', 'platform_fee');
UPDATE system_settings SET group_category = 'security' WHERE key IN ('maintenance_mode');
