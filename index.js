import http from "http";
import url from "url";
import { fetchEmails } from "./controllers/fetch.js";

const server = http.createServer((req, res) => {
    // redirect each request to the right controller
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // if method is post and url is /fetch, call fetch controller
    if (req.method === "POST" && trimmedPath === "fetch") {
        fetchEmails(req, res);
    }
});

server.listen(8000, () => {
    console.log("The server is up and running now");
});
