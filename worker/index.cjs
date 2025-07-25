const Redis = require("ioredis");
const { Worker } = require("bullmq");
const axios = require("axios");
const { redis } = require("../lib/redis.cjs");
const { pool } = require("../lib/db.cjs");
const cloudinary = require("cloudinary").v2;

const publisher = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PW,
    maxRetriesPerRequest: null,
    reconnectOnError: () => true,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function callFlask(base64Frame) {
    try {
        const { data } = await axios.post(`${process.env.FLASK_SERVER_URL}/process`, {
            frame: base64Frame,
        });
        if (data.error) {
            throw new Error(`Flask API error: ${data.error}`);
        }
        return data;
    } catch (err) {
        console.error("[Flask]", err.message);
        throw new Error("Flask API call failed");
    }
}

async function uploadToCloudinary(cameraId, base64Image) {
    try {
        const result = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${base64Image}`,
            {
                folder: "aisoc",
                public_id: `violation-${cameraId}-${Date.now()}`,
            }
        );
        return result.secure_url;
    } catch (err) {
        console.error("[Cloudinary]", err.message);
        throw new Error("Failed to upload to Cloudinary");
    }
}

async function saveToDatabase(cameraId, labels, imageUrl) {
    try {
        const violationType = labels.join(", ");
        await pool.query(
            `INSERT INTO violations (camera_id, violation_type, image_url) VALUES ($1, $2, $3)`,
            [cameraId, violationType, imageUrl]
        );
    } catch (err) {
        console.error("[Postgres]", err.message);
        throw new Error("Failed to insert violation into database");
    }
}

function emitToFrontend(cameraId, annotatedFrame, violation, labels) {
    try {
        const payload = JSON.stringify({
            event: "frameProcessed",
            data: {
                cameraId,
                annotatedFrame,
                violation,
                labels,
            },
        });
        publisher.publish("socket-events", payload);
    } catch (err) {
        console.error("[Redis Pub/Sub]", err.message);
    }
}


async function processFrame(job) {
    const { cameraId, base64Frame } = job.data;

    try {
        const { annotated_frame, violation, violation_labels } = await callFlask(base64Frame);
        if (violation) {
            const cloudinaryUrl = await uploadToCloudinary(cameraId, annotated_frame);
            await saveToDatabase(cameraId, violation_labels, cloudinaryUrl);
        }

        emitToFrontend(cameraId, annotated_frame, violation, violation_labels);
    } catch (err) {
        console.error(`[Job Failed] Camera ${cameraId}:`, err.message);
        throw err;
    }
}


const worker = new Worker("camera-frames", processFrame, { connection: redis });

worker.on("completed", (job) =>
    console.log(`Job completed: ID=${job.id}, Camera=${job.data.cameraId}`)
);

worker.on("failed", (job, err) =>
    console.error(`Job failed: ID=${job?.id}, Reason=${err.message}`)
);