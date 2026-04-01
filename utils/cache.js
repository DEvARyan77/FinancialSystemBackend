const redis = require('../config/redis');

const clearUserDashboardCache = async (userId) => {
  const key = `dashboard-summary:${userId}`;
  await redis.del(key);
};

module.exports = { clearUserDashboardCache };