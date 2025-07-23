const { createServer } = require("http");
const next = require("next");
const { initSocket } = require("../lib/socket.cjs");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res));

    // Initialize socket and attach to server
    initSocket(server);
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server listening at port ${PORT}`);
    });
});
