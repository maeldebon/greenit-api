const Imap = require("imap");

const oldEmails = async (req, res) => {
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

        const oldEmails = global.EMAILS.filter(
            (email) =>
                email.seen === false &&
                email.flagged === false &&
                new Date(email.date) <
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
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
                oldEmails.forEach((email) => {
                    console.log(email);
                    imap.addFlags(email.uid, "\\Deleted", function (err) {
                        if (err) throw err;
                    });
                    imap.setFlags(email.uid, "\\Seen", function (err) {
                        if (err) throw err;
                    });
                });
                imap.expunge();
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
        res.end("Old emails deleted");
    });
};

module.exports = oldEmails;
