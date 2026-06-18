const MatchService = require('../services/match_service');

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
}

module.exports = MatchController;
