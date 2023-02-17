const http = require("http");
const url = require("url");

const cleanupOldEmails = require("./src/controllers/cleanupOldEmails.js");
const fetchEmails = require("./src/controllers/fetch.js");

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    if (req.method === "POST" && trimmedPath === "fetch") {
        fetchEmails(req, res);
    } else if (req.method === "GET" && trimmedPath === "ping") {
        res.writeHead(200);
        res.end("pong");
    } else if (req.method === "POST" && trimmedPath === "cleanup/oldEmails") {
        cleanupOldEmails(req, res);
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

server.listen(8000, () => {
    console.log("The server is up and running now");
    global.EMAILS = [];
});
