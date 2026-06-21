const UserModel = require('../../auth/models/user_model');
const redisClient = require('../../../db/redis_init');

class MatchService {
  /**
   * Find workers near a specific location using PostGIS spatial functions.
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} trade - Trade Category (Electrician, Plumber, etc.)
   * @param {number} [radiusKm=50] - Search radius in kilometers
   */
  static async findNearbyWorkers(lat, lon, trade, radiusKm = 50) {
    const pool = UserModel.getPool();
    const cacheKey = `match:nearby:${lat}:${lon}:${trade}:${radiusKm}`;

    // 1. Try to fetch from Redis cache
    if (redisClient) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      } catch (cacheErr) {
        console.warn('⚠️ Redis Cache Read Error:', cacheErr.message);
      }
    }

    // 2. Query Database if cache miss or Redis unavailable
    const query = `
      SELECT
        id,
        name,
        primary_skill,
        location_name,
        is_verified,
        ST_X(location_coords::geometry) as longitude,
        ST_Y(location_coords::geometry) as latitude,
        ST_DistanceSphere(
          location_coords::geometry,
          ST_MakePoint($1, $2)
        ) / 1000.0 as distance_km
      FROM users
      WHERE
        active_persona = 'provider'
        AND ($3::TEXT IS NULL OR primary_skill ILIKE '%' || $3 || '%')
        AND ST_DWithin(
          location_coords,
          ST_MakePoint($1, $2)::geography,
          $4 * 1000
        )
      ORDER BY distance_km ASC;
    `;

    try {
      const { rows } = await pool.query(query, [lon, lat, trade, radiusKm]);

      // 3. Store result in Redis cache (TTL: 5 minutes)
      if (redisClient && rows.length > 0) {
        try {
          await redisClient.setex(cacheKey, 300, JSON.stringify(rows));
        } catch (cacheSetErr) {
          console.warn('⚠️ Redis Cache Write Error:', cacheSetErr.message);
        }
      }

      return rows;
    } catch (error) {
      console.error('❌ Spatial Query Error:', error.message);
      throw error;
    }
  }
}

module.exports = MatchService;
