const winston = require('winston');
const { combine, timestamp, json, prettyPrint, errors } = winston.format

winston.loggers.add('ExpressLogger', {
    format: combine(
        json(),
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            level: 'info',
            filename: 'logs/info.log'
        }),
        new winston.transports.File({
            level: 'warn',
            filename: 'logs/warnings.log'
        }),
        new winston.transports.File({
            level: 'error',
            filename: 'logs/error.log'
        }),
    ]
})

winston.loggers.add('UserLogger', {
    level: "info",
    format: combine(
            errors({stack: true}),
            timestamp(),
            json(),
            prettyPrint()
        ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/user.log' })
    ],
    defaultMeta: {service: 'UserService' }
})

winston.loggers.add('StatLogger', {
    level: "info",
    format: combine(
            errors({stack: true}),
            timestamp(),
            json(),
            prettyPrint()
        ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/stats.log' })
    ],
    defaultMeta: {service: 'StatService' }
})