const http = require("http");
const url = require("url");

const cleanupOldEmails = require("./src/controllers/cleanupOldEmails.js");
const deleteEmail = require("./src/controllers/delete.js");
const fetchEmails = require("./src/controllers/fetch.js");
const markAsRead = require("./src/controllers/markAsRead.js");
const markAsSpam = require("./src/controllers/markAsSpam.js");
const sendEmail = require("./src/controllers/send.js");

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    if (req.method === "POST" && trimmedPath === "fetch") {
        fetchEmails(req, res);
    } else if (req.method === "POST" && trimmedPath === "send") {
        sendEmail(req, res);
    } else if (req.method === "POST" && trimmedPath === "delete") {
        deleteEmail(req, res);
    } else if (req.method === "POST" && trimmedPath === "read") {
        markAsRead(req, res);
    } else if (req.method === "POST" && trimmedPath === "spam") {
        markAsSpam(req, res);
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

server.listen(process.env.PORT || 8000, () => {
    console.log("The server is up and running now");
    global.EMAILS = [];
});
