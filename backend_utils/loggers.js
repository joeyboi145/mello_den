const winston = require('winston');
const { combine, timestamp, label, errors, printf, align } = winston.format

let UserLogger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        label({ label: 'UserService' }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}\t${info.label}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/user.log' }),
        new winston.transports.File({ filename: 'logs/combined.log'})
    ],
})

let StatLogger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        label({ label: 'StatService' }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level} ${info.label}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/stats.log' }),
        new winston.transports.File({ filename: 'logs/combined.log'})
    ],
})


module.exports = {
    UserLogger,
    StatLogger
}