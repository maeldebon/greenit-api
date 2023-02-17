const http = require("http");
const url = require("url");
const fetchEmails = require("./src/controllers/fetch.js");

const server = http.createServer((req, res) => {
    // redirect each request to the right controller
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // if method is post and url is /fetch, call fetch controller
    if (req.method === "POST" && trimmedPath === "fetch") {
        fetchEmails(req, res);
    } else if (req.method === "GET" && trimmedPath === "ping") {
        res.writeHead(200);
        res.end("pong");
    }
});

server.listen(8000, () => {
    console.log("The server is up and running now");
});
