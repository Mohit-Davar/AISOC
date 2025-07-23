const { Worker } = require("bullmq");
const axios = require("axios");
const { redis } = require("../lib/redis.cjs");

const worker = new Worker(
    "process-frame",
    async (job) => {
        const { cameraId, base64Frame, timestamp } = job.data;

        try {
            const response = await axios.post(`${process.env.FLASK_SERVER_URL}/process`, {
                cameraId,
                frame: base64Frame,
                timestamp,
            });

            console.log(
                `Frame from camera ${cameraId} processed successfully: `,
                response.data
            );
        } catch (err) {
            console.error(
                `Failed to process frame from camera ${cameraId}:`,
                err.message
            );
            throw err;
        }
    },
    { connection: redis }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} has failed with ${err.message}`);
});

console.log("Worker started and listening for frame jobs");