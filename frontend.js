#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config()

const httpFront = express();
const httpsFront = express();

// If code is deployed, redirect connections to HTTP port to HTTPS port 443,
// else, server frontend through HTTP port 80
if (process.env.DEPLOYED === 'true') {
    httpFront.use('/*', (req, res) => {
        res.redirect('https://mello-den.org' + req.originalUrl)
    });
} else {
    httpFront.use(express.static(
        path.join(__dirname, 'build')
    ));

    httpFront.get('/*', (req, res) => {
        res.sendFile(
            path.join(__dirname, 'build', 'index.html')
        );
    });
}

global.httpServer = http.createServer(httpFront);
global.httpServer.listen(80, () => {
    console.log('Frontend HTTP Server listening on port 80');
})


if (process.env.DEPLOYED === 'true') {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/chain.pem', 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    httpsFront.use(express.static(
        path.join(__dirname, 'build')
    ));

    httpsFront.get('/*', (req, res) => {
        res.sendFile(
            path.join(__dirname, 'build', 'index.html')
        );
    });

    global.httpsServer = https.createServer(credentials, httpsFront);
    global.httpsServer.listen(443, () => {
        console.log('Frontend HTTPS Server listening on port 443');
    })
}

process.on('SIGINT', () => {
    global.httpServer.close(() => {
        console.log("\nFrontend HTTP closed");

        // If there's a https server...
        if (global.httpsServer) {
            global.httpsServer.close(() => {
                console.log("Frontend HTTPS closed\n");
                process.exit(0);
            });
        } else process.exit(0);

    });
});

module.exports = {
    httpServer: global.httpServer,
    httpsServer: global.httpsServer
}