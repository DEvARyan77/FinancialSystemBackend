const redis = require('../config/redis');

// Middleware to check cache
const cache = (keyPrefix) => async (req, res, next) => {
  const key = `${keyPrefix}:${req.user.id}`; // cache per user
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    // Store the original res.json to intercept and cache
    res.sendResponse = res.json;
    res.json = (body) => {
      // Cache for 5 minutes (300 seconds)
      redis.setex(key, 300, JSON.stringify(body));
      res.sendResponse(body);
    };
    next();
  } catch (err) {
    console.error('Cache error:', err);
    next();
  }
};

module.exports = cache;