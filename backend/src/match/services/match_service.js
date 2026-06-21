const UserModel = require('../../auth/models/user_model');
const redisClient = require('../../../db/redis_init');

class MatchService {
  /**
   * Find workers near a specific location using Redis Geospatial index with SQL fallback.
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} trade - Trade Category
   * @param {number} [radiusKm=15] - Search radius in kilometers
   */
  static async findNearbyWorkers(lat, lon, trade, radiusKm = 15) {
    const pool = UserModel.getPool();

    // 1. Try Redis Geospatial Search first
    if (redisClient) {
      try {
        console.log(`📡 Redis: Searching active providers within ${radiusKm}km of [${lat}, ${lon}]`);

        // Use GEORADIUS as it's more widely supported in older Redis versions/libraries
        // and provides member IDs directly.
        const nearbyIds = await redisClient.georadius('active_providers', lon, lat, radiusKm, 'km', 'WITHDIST');

        if (nearbyIds && nearbyIds.length > 0) {
          console.log(`✅ Redis: Found ${nearbyIds.length} nearby providers in cache`);

          // nearbyIds is array of [member, distance]
          const ids = nearbyIds.map(item => item[0]);

          // Fetch full profile details for these specific IDs
          const query = `
            SELECT
              id, name, primary_skill, location_name, is_verified,
              ST_X(location_coords::geometry) as longitude,
              ST_Y(location_coords::geometry) as latitude,
              ST_DistanceSphere(location_coords::geometry, ST_MakePoint($1, $2)) / 1000.0 as distance_km
            FROM users
            WHERE id = ANY($3)
            AND ($4::TEXT IS NULL OR primary_skill ILIKE '%' || $4 || '%')
            ORDER BY distance_km ASC;
          `;

          const { rows } = await pool.query(query, [lon, lat, ids, trade]);
          return rows;
        }
      } catch (redisErr) {
        console.warn('⚠️ Redis Geospatial Search Error, falling back to SQL:', redisErr.message);
      }
    }

    // 2. Fallback to PostGIS SQL scan if Redis is empty or errors
    console.log('🔄 Fallback: Executing PostGIS spatial scan...');
    const fallbackQuery = `
      SELECT
        id, name, primary_skill, location_name, is_verified,
        ST_X(location_coords::geometry) as longitude,
        ST_Y(location_coords::geometry) as latitude,
        ST_DistanceSphere(location_coords::geometry, ST_MakePoint($1, $2)) / 1000.0 as distance_km
      FROM users
      WHERE
        active_persona = 'provider'
        AND is_available = true
        AND ($3::TEXT IS NULL OR primary_skill ILIKE '%' || $3 || '%')
        AND ST_DWithin(
          location_coords,
          ST_MakePoint($1, $2)::geography,
          $4 * 1000
        )
      ORDER BY distance_km ASC;
    `;

    try {
      const { rows } = await pool.query(fallbackQuery, [lon, lat, trade, radiusKm]);
      return rows;
    } catch (error) {
      console.error('❌ PostGIS Fallback Error:', error.message);
      throw error;
    }
  }
}

module.exports = MatchService;
