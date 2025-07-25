const { createServer } = require("http");
const next = require("next");
const Redis = require("ioredis");
const { initSocket, getIO } = require("../lib/socket.cjs");

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const subscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PW,
    maxRetriesPerRequest: null,
});

subscriber.subscribe("socket-events", (err, count) => {
    if (err) {
        console.error("Failed to subscribe to Redis channel:", err.message);
    }
});

subscriber.on("message", (channel, message) => {
    try {
        const { event, data } = JSON.parse(message);
        const io = getIO();
        io.emit(event, data);
    } catch (err) {
        console.error("Socket emit failed:", err.message);
    }
});

app.prepare().then(async () => {
    const server = createServer((req, res) => handle(req, res));
    try {
        initSocket(server);
    } catch (err) {
        console.error("Failed to initialize Socket.IO:", err.message);
    }
    server.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}`);
    });
});
