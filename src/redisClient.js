const Redis = require('ioredis');

// Create a Redis client using the URL from .env file
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Log when connected
redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
});

// Log if there's an error
redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

module.exports = redis;
