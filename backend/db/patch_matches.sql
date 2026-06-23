-- Match results for background processing
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5, 2), -- 0 to 100 based on distance/rating
    status TEXT DEFAULT 'proposed', -- 'proposed', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, provider_id)
);

-- Index for worker lookups
CREATE INDEX IF NOT EXISTS idx_matches_booking ON matches(booking_id);
