// server.js - Custom Hostinger Passenger Adapter
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma securely with connection limits for Hostinger LVE
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + "?connection_limit=3&pool_timeout=10",
        },
    },
});
global.prisma = prisma;

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true);

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    })
        .once("error", (err) => {
            console.error("CRITICAL FATAL ERROR:", err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
