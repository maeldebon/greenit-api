const Imap = require("imap");

const sendEmail = (req, res) => {
    req.on("data", (chunk) => {
        let body = [];
        body.push(chunk);
        body = Buffer.concat(body).toString();
        body = JSON.parse(body);
        console.log(body);

        if (
            !body.email ||
            !body.password ||
            !body.host ||
            !body.port ||
            !body.to ||
            !body.subject ||
            !body.text
        ) {
            res.statusCode = 400;
            return res.end(
                "Email, password, host, port, to, subject or text is missing"
            );
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
                imap.append(
                    "From: " +
                        body.email +
                        "\r" +
                        "To: " +
                        body.to +
                        "\r" +
                        "Subject: " +
                        body.subject +
                        "\r" +
                        "\r" +
                        body.text,
                    { mailbox: "INBOX", flags: ["\\Seen"] },
                    function (err) {
                        if (err) throw err;
                        console.log("Message appended");
                        imap.end();
                    }
                );
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
        res.end("Email sent");
    });
};

module.exports = sendEmail;
