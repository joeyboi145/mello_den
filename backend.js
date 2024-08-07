#!/usr/bin/env node

// Import Modules
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const ServerMailer = require('./utils/mailer.js');
const crypto = require('node:crypto')
const fs = require('fs');
const http = require('http')
const https = require('https');
const bcrypt = require('bcrypt');
const { Logger, ExpressLogger, ErrorLogger } = require('./utils/loggers.js');
const RequestErrors = require('./utils/request_errors.js')
const Utils = require('./utils/functions.js');

if (process.env.DEPLOYED !== 'true') require('dotenv').config()
const SERVER_PASS = process.env.SERVER_PASS
const SESSION_SECRET = process.env.SERVER_SECRET;

let domain = 'localhost';
let frontendURL = `http://localhost:3000`
let mongoURL = `mongodb://localhost/mello_den`;
if (process.env.DEPLOYED === 'true') {
    domain = 'mello-den.org'
    frontendURL = `https://${domain}`
    mongoURL = `mongodb://server:${SERVER_PASS}@localhost/mello_den?authSource=admin`;
    global.privateKey = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/privkey.pem', 'utf8');
    global.certificate = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/cert.pem', 'utf8');
    global.ca = fs.readFileSync('/etc/letsencrypt/live/mello-den.org/chain.pem', 'utf8');
    global.credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
}
const PORT = 1111;
const app = express();
const DAY = 1_000 * 60 * 60 * 24;
let server_status = "DOWN";
let deadline = Utils.calculateDeadline()

const checkDeadline = () => {
    if (new Date() > deadline) {
        Logger.info(`New deadline set: ${deadline.toISOString()}`);
        deadline = Utils.calculateDeadline();
    }
}

// Connect to MongoDB database
mongoose.connect(mongoURL);
const DATABASE = mongoose.connection;

// Define ServerMail
const mailer = new ServerMailer("melloden5058@gmail.com", SERVER_PASS);

// Store User Sessions
const store = new MongoDBSession({
    uri: mongoURL,
    collection: 'sessions'
})


// Middleware
app.use(express.json());
app.use(mongoSanitize());
app.use(cors({
    origin: frontendURL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true
}));
app.use(
    session({
        name: 'mello_session',
        secret: SESSION_SECRET,
        cookie: {
            name: 'mello_token',
            domain: domain,
            maxAge: 12 * 60 * 60 * 1000,
            secure: process.env.DEPLOYED === "true",
            sameSite: true
        },
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(ExpressLogger);

// Assign a request ID to each request
app.use((req, res, next) => {
    const id = crypto.randomBytes(5).toString('hex')
    req._id = id
    res._id = id
    next()
});

// Import Mongoose Models
const User = require('./models/User.js');
const StatForm = require('./models/StatForm.js');
const Announcement = require('./models/Announcement.js');
const Event = require('./models/Event.js');
const EmailRecord = require('./models/EmailRecord.js')
const Token = require('./models/Token.js');
const ChangeLog = require('./models/ChangeLog.js');


/* Backend host on PORT */
/* SERVER MAINTENANCE */

app.get('/status', async (req, res) => {
    Logger.info(`GET '/status' (${req._id})`);
    res.status(200).json({
        status: server_status,
        uptime: process.uptime()
    })
});

// app.use('/test', async (req, res) => {
//     Logger.info(`${req.method} '/test (${req._id})` )
//     for (const property in req.body) Logger.info(`... ${property}`);
//     for (const property in req.params) Logger.info(`... ${property}`);
//     res.status(200).json({
//         params: {
//             ...req.params
//         },
//         body: {
//             ...req.body
//         }
//     })
// });

// app.post('/kill', async (req, res) => {
//     Logger.info("POST '/kill (${req._id})");
//     res.status(200);
//     process.exit(0);
// })

/* AUTHENTICATION */

app.get('/api/authenticate', async (req, res, next) => {
    try {
        Logger.info(`GET '/auth' ${req.session.username} (${req._id})`)
        if (!req.session.login) return RequestErrors.handleCredentialsError(res, req._id);

        const user = await User.findById(req.session.userID)
        if (user) {
            const userInfo = Utils.createUserInfo(true, user.username, user.verified, user.admin);
            res.status(200).json({
                user_found: true,
                ...userInfo
            });
            Logger.info(`SUCCESS: User ${user.username} authenticated, (${req._id})`)
        } else {
            req.session.destroy(() => {
                RequestErrors.handleUserQueryError(res, req._id);
            })
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err, req._id);
        next(err);
    }
});

app.post('/api/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        Logger.info(`POST '/login' ${username} (${req._id})`)
        if (req.session.login) {
            var errors = { login: 'User already logged in' }
            res.status(400).json({ errors });
            return Logger.warn(`FAILED: User already logged in, (${req._id})`)
        } else if (!username || !password) {
            var errors = {
                username: (username ? '' : 'Please enter a username.'),
                password: (password ? '' : 'Please enter your password.')
            }
            res.status(400).json({ errors });
            return Logger.warn(`FAILED: Incorrectly formatted body, (${req._id})`)
        }

        const user = await User.findOne({ username })
        if (user) {
            Logger.info(`... User ${username} found, (${req._id}) `)
            let hashPassword = user.password;
            const isMatch = bcrypt.compare(password, hashPassword);
            if (isMatch) {
                Utils.createSession(req, user);
                Logger.info(`... Session ${req.sessionID} created, (${req._id})`)
                const userInfo = Utils.createUserInfo(true, user.username, user.verified, user.admin);
                res.status(200).json({
                    ...userInfo,
                    email: (!user.verified ? user.email : '')
                });
                return Logger.info(`SUCCESS: User ${username} logged in, (${req._id})`)
            } else Logger.warn(`... passwords did not match, (${req._id})`)
        } else Logger.warn(`... User NOT found, (${req._id})`)

        // If user not found or passwords don't match ...
        var errors = { login: 'Incorrect login information' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User not logged in, (${req._id})`)
    } catch (err) {
        RequestErrors.handleServerError(res, err, req._id);
        next(err)
    }
});

app.post('/api/logout', async (req, res, next) => {
    let username = req.session.username;
    let sessionID = req.sessionID;
    try {
        Logger.info(`POST '/logout' ${username} (${req._id})`);
        if (!req.session.login) return RequestErrors.handleCredentialsError(res);

        req.session.destroy(() => {
            res.status(200).json({ logout: true });
            Logger.info(`... Session ${sessionID} destoryed, (${req._id})`)
            Logger.info(`SUCCESS: User ${username} logged out, (${req._id})`)
        })
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
})

app.post('/api/register', async (req, res, next) => {
    const { email, username, password } = req.body
    try {
        Logger.info(`POST '/register' ${username} (${req._id})`)
        const user = await User.create({ email, username, password });
        Utils.createSession(req, user);
        Logger.info(`... Session ${req.sessionID} created, (${req._id})`)
        const userInfo = Utils.createUserInfo(true, user.username, user.verified, user.admin);
        res.status(201).json({
            ...userInfo,
            email: user.email,
        });
        Logger.info(`SUCCESS: New ${username} user created (${req._id})`);

    } catch (err) {
        if (err.message.includes('duplicate key error') ||
            err.message.includes('User validation failed')) {
            RequestErrors.handleRegistrationErrors(res, err);
        } else {
            RequestErrors.handleServerError(res, err);
            next(err)
        }
    }
});



/* USERS */

app.post('/users/:username/email-verification', async (req, res, next) => {
    const username = req.params.username;
    try {
        Logger.info(`POST '/email-verification' ${username} (${req._id})`);
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && !req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res)
        }

        const user = await User.findOne({ username })
        if (!user) return RequestErrors.handleUserQueryError(res);
        if (!await Utils.ableToSendEmail(user, res)) return

        const tokenRecord = await Token.findOne({ user: user._id, type: 'verification' });
        if (tokenRecord) {
            await Token.findByIdAndDelete(tokenRecord._id);
            Logger.info(`... previous verification token record found. Was deleted, (${req._id})`)
        }

        let token = crypto.randomBytes(3).toString('hex').toUpperCase();
        await Token.create({ user: user._id, token, type: 'verification' });
        Logger.info(`... created new token record for user ${username}, token ${token}, (${req._id})`)
        const verification_email = mailer.createVerificationEmail(username, user.email, token);
        mailer.sendEmail(verification_email)
            .then(sent => {
                let emails_accepted = sent.accepted.length;
                mailer.registerSuccessfulEmail(emails_accepted, res._id);
                res.status(200).json({
                    sent: true,
                    email: user.email,
                    message: `Email sent: ${sent.response}`,
                })
                Logger.info(`SUCCESS: Verification email sent: \n${sent.response}\n(${req._id})`)
            })
            .catch(err => {
                var errors = {
                    sent: false,
                    email: user.email,
                    message: `Email failed: ${err}`
                }
                res.status(500).json({ errors });
                Logger.warn(`FAILED: Verification email failed: \n${err}\n(${req._id})`)
            });
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
});

app.post('/users/:username/verify', async (req, res, next) => {
    const username = req.params.username;
    const { token } = req.body;
    try {
        Logger.info(`POST '/verify' ${username} (${req._id})`);
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res);
        } else if (!token) {
            var errors = { token: 'Please enter a verification token' }
            res.status(400).json({ errors })
            return Logger.warn(`FAILED: Verification token not found, (${req._id})`)
        }

        const user = await User.findOne({ username })
        if (!user) return RequestErrors.handleUserQueryError(res);
        let tokenRecord = await Utils.ableToVerify(user, res);
        if (!tokenRecord) return

        if (tokenRecord.token === token) {
            await User.findByIdAndUpdate(user._id, { verified: true })
            req.session.verified = true;
            req.session.save();
            res.status(200).json({ verified: true });
            Logger.info(`SUCCESS: Correct token enterd, User ${username} verified, (${req._id})`)
        } else {
            var errors = { token: 'Incorrect token entered' }
            res.status(400).json({ errors })
            Logger.warn(`FAILED: Incorrect token entered, User ${username} NOT verified, (${req._id})`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
});

// app.post('/users/:username/reset-password', async (req, res, next) => {
//     const username = req.params.username;
//     const token = req.query.token
//     try {
//         Logger.info(`POST '/users/${username}/reset-password?token=${token} (${req._id})`)
//         res.status(200).send();
//     } catch (err) {
//         RequestErrors.handleServerError(res, err)
//         next(err)
//     }
// })

/* STATS SYSTEM */

async function getStatWinners(date = new Date()) {
    let startTime = new Date(date - (date % DAY) - DAY)
    let endTime = new Date(date - (date % DAY))
    let forms = await StatForm.aggregate([
        {
            $match: {
                done_at: {
                    $gt: startTime,
                    $lt: endTime
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'done_by',
                foreignField: '_id',
                pipeline: [{
                    $project: {
                        _id: 0,
                        username: 1
                    }
                }],
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ]);

    let stat_winner = { username: "No Winner", score: -1 };
    let hydration_winner = { username: "No Winner", score: -1 };
    let sleep_winner = { username: "No Winner", score: -1 }
    let sunscreen_winner = { username: "No Winner", score: -1 };

    forms.map(form => {
        let totalScore = Utils.getScore(form);
        stat_winner = Utils.determineWinner(stat_winner, form.user.username, totalScore);
        hydration_winner = Utils.determineWinner(hydration_winner, form.user.username, form.hydration_level);
        sleep_winner = Utils.determineWinner(sleep_winner, form.user.username, form.sleep);
        sunscreen_winner = Utils.determineWinner(sunscreen_winner, form.user.username, form.sunscreen);
    })
    return {
        stat_winner,
        hydration_winner,
        sleep_winner,
        sunscreen_winner
    }
}

app.get('/stats/winners', async (req, res, next) => {
    let day = null
    if (!req.params.day) day = new Date()
    else day = new Date(req.params.day);
    try {
        Logger.info(`GET '/stats/winner?day=${day.toString()} (${req._id})'`)

        let winners = await getStatWinners(day);
        res.status(200).json(winners);
        Logger.info(`... winners: ${Utils.stringifyTabObject(winners)} (${req._id})`)
        Logger.info(`SUCCESS: Winners calculated for ${day.toString()}, (${req._id})`)
    } catch (err) {
        RequestErrors.handleServerError(res, err)
        next(err)
    }
});


// FIXME: Add a date parameter
app.get('/stats/form/:username', async (req, res, next) => {
    let username = req.params.username;
    try {
        Logger.info(`GET '/stats/form/${username} (${req._id})'`);
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await User.findOne({ username });
        if (!user) return RequestErrors.handleUserQueryError(res);
        const statForm = await StatForm.findOne({
            done_by: user._id,
            done_at: {
                $gt: new Date(deadline - DAY),
                $lt: deadline
            }
        });

        if (statForm) {
            res.status(200).json({
                hydration_level: statForm.hydration_level,
                meals: {
                    meal_1: statForm.meals.meal_1,
                    meal_2: statForm.meals.meal_2,
                    breakfast: statForm.meals.breakfast
                },
                sleep: statForm.sleep,
                sunscreen: statForm.sunscreen,
                completed: statForm.completed
            });
            Logger.info(`SUCCESS: Stat form found for user ${username}, (${req._id})`)
        } else {
            var errors = { form: "Form not found" }
            res.status(404).json({ errors });
            Logger.warn(`FAILED: Stat form NOT found for user ${username}, (${req._id})`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
});

// FIXME: Add a date parameter
app.get('/stats/form/:username/check', async (req, res, next) => {
    let username = req.params.username;
    try {
        Logger.info(`POST '/stats/form/${username}/check (${req._id})'`);
        checkDeadline();
        const user = await User.findOne({ username });
        if (!user) return RequestErrors.handleUserQueryError(res);
        const statForm = await StatForm.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (statForm) {
            res.status(200).json({
                completed: statForm.completed
            });
            Logger.info(`SUCCESS: Stat form completed: ${statForm.completed}, (${req._id})`)
        } else {
            var errors = { form: "Form not found" }
            res.status(400).json({ errors });
            Logger.warn(`FAILED: Stat form NOT found for user ${username}, (${req._id})`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
});

app.get('/stats/form/:username/score', async (req, res, next) => {
    let username = req.params.username;
    try {
        Logger.info(`POST '/stats/form/${username}/score (${req._id})'`);
        checkDeadline();
        const user = await User.findOne({ username });
        if (!user) return RequestErrors.handleUserQueryError(res);
        const statForm = await StatForm.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (statForm) {
            let totalScore = Utils.getScore(statForm)
            res.status(200).json({ score: totalScore });
            Logger.info(`SUCCESS: Stat form score: ${totalScore}, (${req._id})`)
        } else {
            var errors = { form: "Form not found" }
            res.status(400).json({ errors });
            Logger.warn(`FAILED: Stat form NOT found for user ${username}, (${req._id})`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err)
    }
});

// FIXME: needs form validation
app.post('/stats/form/:username', async (req, res, next) => {
    let username = req.params.username;
    let statForm = req.body
    try {
        Logger.info(`POST '/stats/form/${username}' (${req._id})`);
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await User.findOne({ username });
        if (!user) return RequestErrors.handleUserQueryError(res);
        const prevStatForm = await StatForm.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (prevStatForm) {
            Logger.info(`... Previous stat form found, (${req._id})`)
            if (!prevStatForm.complete) {
                let prevScore = Utils.getScore(prevStatForm)
                let newScore = Utils.getScore(statForm)
                if (prevScore != newScore) {
                    await StatForm.findOneAndUpdate({
                        ...statForm,
                        done_at: new Date()
                    });
                    res.status(200).json({ saved: true })
                    Logger.info(`SUCCESS: Stat form for user ${username} updated, (${req._id})`)
                } else {
                    res.status(200).json({ saved: true })
                    Logger.info(`SUCCESS: Stat form for user ${username} remained unchanged, (${req._id})`)
                }
            } else {
                var errors = {
                    saved: false,
                    form: "Stat check form was already submitted and completed"
                }
                res.status(400).json({ errors })
                Logger.warn(`FAILED: User ${username}already completed their form for the day, (${req._id})`)
            }
        } else {
            Logger.info(`... NO Previous stat form found, (${req._id})`)
            await StatForm.create({
                ...statForm,
                done_by: user._id,
                done_at: new Date()
            });
            res.status(201).json({ saved: true })
            Logger.info(`SUCCESS: New stat form created for user ${username}, (${req._id})`)
        }
    } catch (err) {
        if (err.message.includes('StatForm validation failed')) {
            RequestErrors.handleStatFormError(res, err);
        } else {
            RequestErrors.handleServerError(res, err);
            next(err)
        }
    }
});

app.delete('/stats/form/:username', async (req, res, next) => {
    let username = req.params.username;
    try {
        Logger.info(`POST '/stats/form/${username}' (${req._id})`);
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await User.findOne({ username });
        if (!user) return RequestErrors.handleUserQueryError(res);
        const response = await StatForm.deleteOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });
        if (response.deletedCount === 1) {
            res.status(200).json({ deleted: response.deletedCount === 1 })
            Logger.info(`SUCCESS: Stat form for user ${username}, (${req._id})`)
        } else {
            res.status(500).json({ deleted: response.deletedCount === 1 })
            Logger.warn(`FAILED: Stat form for user ${username} NOT deleted, (${req._id})`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err)
        next(err)
    }
});

/* CHANGE LOG */
/*
app.get('/changes', async (req, res, next) => {
    try {
        Logger.info(`GET '/changes' (${req._id})`)



    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err);
    }
})

app.post('/changes/log', async (req, res, next) => {
    const { version, title, description, text } = req.body
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (!req.session.admin) {
            return RequestErrors.handleAdminAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        }

        await ChangeLog.create({
            version,
            title,
            description,
            text
        })
        res.status(201)
        Logger.info(`SUCCESS: new change log version ${version} created, (${req._id})`)
    } catch (err) {
        if (err.message.includes('ChangeLog validation failed')) {
            RequestErrors.handleStatFormError(res, err);
        } else {
            RequestErrors.handleServerError(res, err);
            next(err);
        }
    }
})

app.delete('/changes/log', async (req, res, next) => {
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (!req.session.admin) {
            return RequestErrors.handleAdminAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        } s

    } catch (err) {
        RequestErrors.handleServerError(res, err);
        next(err);
    }
})

*/

// User winton-express error logger
app.use(ErrorLogger);


if (process.env.DEPLOYED === 'true') {
    global.server = https.createServer(global.credentials, app);
    global.serverType = 'HTTPS';
} else {
    global.server = http.createServer(app);
    global.serverType = 'HTTP';
}

DATABASE.on('error', (err) => {
    Logger.error(`FAILED: Server error...\n${err.stack}\n`)
});
DATABASE.on('open', () => {
    global.server.listen(PORT, () => {
        Logger.info(`\n\nBackend ${global.serverType} server listening on port ${PORT}\n`)
    });
    global.server.maxHeadersCount = 0;
});

process.on('SIGINT', () => {
    if (DATABASE) {
        DATABASE.close()
            .then(() => {
                global.server.close(() => {
                    Logger.info(`\n\nDatabase instance disconnected. Backend ${global.serverType} server closed\n`);
                    process.exit(0)
                })
            })
            .catch((err) => {
                Logger.error(`FAILED: Server error...\n${err.stack}\n`)
            })
    } else {
        global.server.close(() => {
            Logger.info(`\n\nBackend ${global.serverType} server closed\n`);
            process.exit(0)
        })
    }
});