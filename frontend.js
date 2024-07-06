const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const httpFront = express();
const httpsFront = express();
const privateKey = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

httpFront.use('/*', (req, res) => {
    res.redirect('https://mello-den.org' + req.originalUrl)
})

httpsFront.use(express.static(
    path.join(__dirname, 'build')
));

httpsFront.get('/*', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'build', 'index.html')
    );
});

const httpServer = http.createServer(httpFront);
const httpsServer = https.createServer(credentials, httpsFront);

httpServer.listen(80, () => {
    console.log('Frontend HTTP Server listening on port 80');
})

httpsServer.listen(443, () => {
    console.log('Frontend HTTPS Server listening on port 443');
})


process.on('SIGINT', () => {
    httpServer.close(() => {
        console.log("\nFrontend HTTP closed");
        httpsServer.close(() => {
            console.log("Frontend HTTPS closed\n");
            process.exit(0);
        });
    });
});

module.exports = {
    httpServer,
    httpsServer
}