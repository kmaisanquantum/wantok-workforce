const express = require('express');
const router = express.Router();
const MatchController = require('../controllers/match_controller');

/**
 * Match Engine API Endpoints
 */

// GET /api/match/nearby -> Retrieve sorted list of nearby providers based on coords and trade
router.get('/nearby', MatchController.getNearbyWorkers);

module.exports = router;
