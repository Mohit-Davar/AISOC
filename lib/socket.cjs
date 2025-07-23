let ioInstance = null;

function initSocket(server) {
    const { Server } = require("socket.io");

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e7,
    });

    io.on("connection", (socket) => {
        console.log("Client connected");

        socket.on("feed", async ({ frame, id }) => {
            const frameQueue = require("./queue.cjs");
            try {
                await frameQueue.add("process-frame", {
                    cameraId: id,
                    base64Frame: frame,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("Failed to add frame to queue:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    ioInstance = io;
    return io;
}

function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized");
    }
    return ioInstance;
}

module.exports = { initSocket, getIO };
