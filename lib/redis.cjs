const Redis = require("ioredis")

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PW,
  maxRetriesPerRequest: null
});

redis.on("connect", async () => {
  console.log("Redis client connected");
});
redis.on("error", (err) => console.error("Redis client error:", err));

module.exports = { redis }