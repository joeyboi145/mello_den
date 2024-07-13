const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

const { combine, timestamp, errors, json, printf, align, prettyPrint } = winston.format
const Transport = winston.transports;

expressWinston.requestWhitelist.push('session');
expressWinston.requestWhitelist.push('body');
expressWinston.requestWhitelist.push('_id');
expressWinston.bodyBlacklist.push('password');
expressWinston.responseWhitelist.push('body');


var APITransport = new winston.transports.DailyRotateFile({
    filename: 'logs/api/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

var RequestsTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/requests/%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

var ErrorsTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/errors/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

APITransport.on('error', error => {
    console.error.bind(error);
});

RequestsTransport.on('error', error => {
    console.error.bind(error);
});

ErrorsTransport.on('error', error => {
    console.error.bind(error);
});


let Logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new Transport.Console(),
        APITransport
    ],
})

let ExpressLogger = expressWinston.logger({
    format: combine(
        json(),
        timestamp(),
        prettyPrint()
    ),
    transports: [
        RequestsTransport
    ]
});


let ErrorLogger = expressWinston.errorLogger({
    format: combine(
        json(),
        timestamp(),
        errors({ stack: true }),
        prettyPrint()
    ),
    transports: [
        new Transport.Console(),
        ErrorsTransport
    ],
})

module.exports = {
    Logger,
    ExpressLogger,
    ErrorLogger
}