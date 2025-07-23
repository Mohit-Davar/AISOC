const { redis } = require("./redis.cjs");
const { Queue } = require("bullmq")

const frameQueue = new Queue("camera-frames", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

module.exports = { frameQueue }