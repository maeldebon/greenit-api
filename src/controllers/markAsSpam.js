const Imap = require("imap");

const markAsSpam = (req, res) => {
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

        const imap = new Imap({
            user: body.email,
            password: body.password,
            host: body.host,
            port: body.port,
            tls: body.tls || true,
        });

        imap.once("ready", function () {
            imap.openBox("INBOX", true, function (err) {
                if (err) throw err;
                imap.addFlags(body.uid, "\\Spam", function (err) {
                    if (err) throw err;
                });
                imap.end();
            });
        });

        imap.once("error", function (err) {
            console.log(err);
        });

        imap.once("end", function () {
            console.log("Connection ended");
        });

        imap.connect();

        res.writeHead(200);
        res.end("Email marked as spam");
    });
};

module.exports = markAsSpam;
