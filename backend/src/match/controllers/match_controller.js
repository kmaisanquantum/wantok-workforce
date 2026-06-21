const MatchService = require('../services/match_service');
const UserModel = require('../../auth/models/user_model');
const redisClient = require('../../../db/redis_init');

class MatchController {
  static async getNearbyWorkers(req, res) {
    try {
      const { latitude, longitude, trade_category, radius } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const searchRadius = radius ? parseFloat(radius) : 50;

      if (isNaN(lat) || lon > 180 || lon < -180 || lat > 90 || lat < -90) {
        return res.status(400).json({ error: 'Invalid coordinate values' });
      }

      console.log(`🔍 [Match] Searching for '${trade_category || 'Any'}' near [${lat}, ${lon}] within ${searchRadius}km`);

      // Publish Job Alert to Redis Pub/Sub for worker matchmaking
      if (redisClient) {
        const jobPayload = {
          lat,
          lon,
          trade_category,
          radius: searchRadius,
          timestamp: new Date().toISOString()
        };
        redisClient.publish('job_alerts', JSON.stringify(jobPayload));
      }

      const workers = await MatchService.findNearbyWorkers(lat, lon, trade_category, searchRadius);

      return res.status(200).json({
        results_count: workers.length,
        search_params: { lat, lon, trade_category, radius: searchRadius },
        workers
      });
    } catch (error) {
      console.error('❌ MatchController Error:', error);
      return res.status(500).json({ error: 'Internal server error during spatial matching' });
    }
  }

  static async getCategories(req, res) {
    try {
      const cacheKey = 'wantok_categories';

      // 1. Check Redis RAM cache
      if (redisClient) {
        try {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            console.log('⚡ Redis: Cache hit for trades categories grid');
            return res.status(200).json(JSON.parse(cached));
          }
        } catch (err) {
          console.warn('⚠️ Redis Cache Read Error:', err.message);
        }
      }

      // 2. Query PostgreSQL fallback
      console.log('🔄 Cache miss: Querying PostgreSQL for categories');
      const pool = UserModel.getPool();
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY label ASC');

      // 3. Store result in Redis (1-week TTL: 604800s)
      if (redisClient && rows.length > 0) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(rows), 'EX', 604800);
          console.log('✅ Redis: Categories cached for 1 week');
        } catch (err) {
          console.warn('⚠️ Redis Cache Write Error:', err.message);
        }
      }

      return res.status(200).json(rows);
    } catch (error) {
      console.error('❌ getCategories Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  }
}

module.exports = MatchController;
