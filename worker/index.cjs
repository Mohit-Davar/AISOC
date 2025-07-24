const { Worker } = require("bullmq");
const axios = require("axios");
const { redis } = require("../lib/redis.cjs");
const { pool } = require("../lib/db.cjs");
const cloudinary = require("cloudinary").v2;
const { getIO } = require("../lib/socket.cjs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function callFlask(base64Frame) {
    const response = await axios.post(`${process.env.FLASK_SERVER_URL}/process`, {
        frame: base64Frame,
    });
    return response.data;
}

async function uploadToCloudinary(cameraId, annotated_frame) {
    const uploadRes = await cloudinary.uploader.upload(`data:image/jpeg;base64,${annotated_frame}`, {
        folder: "aisoc",
        public_id: `violation-${cameraId}-${Date.now()}`,
    });
    return uploadRes.secure_url;
}

async function saveToDatabase(cameraId, timestamp, violation_labels, cloudinaryUrl) {
    await pool.query(
        `INSERT INTO violations (camera_id, timestamp, labels, image_url)
        VALUES ($1, $2, $3, $4)`,
        [cameraId, timestamp, violation_labels, cloudinaryUrl]
    );
}

function emitToFrontend(cameraId, timestamp, annotated_frame, violation, violation_labels, cloudinaryUrl) {
    const io = getIO();
    io.emit("frameProcessed", {
        cameraId,
        timestamp,
        annotated_frame,
        violation,
        labels: violation_labels,
        image_url: cloudinaryUrl,
    });
}

async function processFrame(job) {
    const { cameraId, base64Frame, timestamp } = job.data;

    try {
        const { annotated_frame, violation, violation_labels } = await callFlask(base64Frame);
        let cloudinaryUrl = null;

        if (violation) {
            cloudinaryUrl = await uploadToCloudinary(cameraId, annotated_frame);
            await saveToDatabase(cameraId, timestamp, violation_labels, cloudinaryUrl);
        }

        emitToFrontend(cameraId, timestamp, annotated_frame, violation, violation_labels, cloudinaryUrl);

    } catch (err) {
        console.error(`Failed to process frame from camera ${cameraId}:`, err.message);
        throw err;
    }
}

const worker = new Worker(
    "process-frame",
    processFrame,
    { connection: redis }
);