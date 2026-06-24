const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../../../db/redis_init');

const createAuthLimiter = (prefix) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: `rl:${prefix}:`
    }) : undefined, // Fallback to memory store if Redis is unavailable
  });
};

module.exports = {
  loginLimiter: createAuthLimiter('login')
};
