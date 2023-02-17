const Imap = require("imap");

const fetchEmails = (req, res) => {
    req.on("data", (chunk) => {
        let body = [];
        body.push(chunk);
        body = Buffer.concat(body).toString();
        body = JSON.parse(body);
        console.log(body);

        if (!body.email || !body.password || !body.host || !body.port) {
            res.statusCode = 400;
            return res.end("Email, password, host or port is missing");
        }

        const emails = [];

        const imap = new Imap({
            user: body.email,
            password: body.password,
            host: body.host,
            port: body.port,
            tls: body.tls || true,
        });

        function openInbox(cb) {
            imap.openBox("INBOX", true, cb);
        }

        imap.once("ready", function () {
            openInbox(function (err, box) {
                if (err) throw err;
                const f = imap.seq.fetch("1:3", {
                    bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
                    struct: true,
                });
                f.on("message", function (msg) {
                    let currentEmail = {};
                    msg.on("body", function (stream) {
                        let buffer = "";
                        stream.on("data", function (chunk) {
                            buffer += chunk.toString("utf8");
                        });
                        stream.once("end", function () {
                            currentEmail = {
                                ...currentEmail,
                                from: Imap.parseHeader(buffer).from[0],
                                to: Imap.parseHeader(buffer).to[0],
                                subject: Imap.parseHeader(buffer).subject[0],
                                date: Imap.parseHeader(buffer).date[0],
                            };
                        });
                    });
                    msg.once("attributes", function (attrs) {
                        currentEmail = {
                            ...currentEmail,
                            seen: attrs.flags.includes("\\Seen"),
                            flagged: attrs.flags.includes("\\Flagged"),
                            answered: attrs.flags.includes("\\Answered"),
                        };
                    });

                    msg.once("end", function () {
                        emails.push(currentEmail);
                    });
                });
                f.once("error", function (err) {
                    console.log("Fetch error: " + err);
                });
                f.once("end", function () {
                    console.log("Done fetching all messages!");
                    console.log(emails);
                    imap.end();

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(emails));
                });
            });
        });

        imap.once("error", function (err) {
            console.log(err);
        });

        imap.once("end", function () {
            console.log("Connection ended");
        });

        imap.connect();
    });
};

module.exports = fetchEmails;
