const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;

let redisClient = null;

if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });

  redisClient.on('connect', () => {
    console.log('▲ SUCCESS: Connected cleanly to wantok-redis cluster.');
  });

  redisClient.on('error', (err) => {
    console.error('▼ ERROR: Redis caching cluster unreachable:', err);
  });
} else {
  console.warn('⚠️ REDIS_URL not provided. Redis caching disabled.');
}

module.exports = redisClient;
