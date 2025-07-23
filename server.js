const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e7,
    });

    io.on("connection", (socket) => {
        console.log("Client connected");

        socket.on("camera_frame", ({ frame, id }) => {
            console.log("Frame received from", id);
            // TODO: Push to Redis or queue for Flask processing
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
});