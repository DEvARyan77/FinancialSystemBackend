const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
  // Use the full connection string (e.g., from Upstash, Redis Labs, etc.)
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Fallback to local Redis with host/port
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  });
}

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

module.exports = redis;