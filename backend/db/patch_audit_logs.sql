-- Audit logs for system events
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level TEXT NOT NULL, -- INFO, WARN, ERROR, SEC
    action TEXT NOT NULL,
    metadata JSONB
);

-- Seed initial logs
INSERT INTO audit_logs (level, action) VALUES
('INFO', 'System audit engine initialized'),
('INFO', 'PostgreSQL PostGIS extension verified'),
('SEC', 'Master Admin session established from internal network'),
('INFO', 'Worker matching engine started in background mode')
ON CONFLICT DO NOTHING;
