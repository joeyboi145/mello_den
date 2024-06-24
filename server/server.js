const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const ServerMailer = require('./mailer.js');
const crypto = require('node:crypto')
const bcrypt = require('bcrypt');
const RequestErrors = require('./RequestErrors.js')
const mongoURI = "mongodb://localhost/mello_den";
const PORT = 3333;
const app = express();
let server_status = "DOWN"

// Check Commandline Arguments
let userArgs = process.argv.slice(2);
if (userArgs.length !== 1) {
    return console.log('ERROR: Incorrect number of arguments')
}
const MAIL_PASS = userArgs[0];

// Connect to MongoDB database
mongoose.connect(mongoURI);
const DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define ServerMail
const mailer = new ServerMailer("melloden5058@gmail.com", MAIL_PASS);

// Store User Sessions
const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'sessions'
})

// Middleware
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
}))
app.use(
    session({
        name: 'mello_session',
        secret: "supersecret difficult to guess string",
        cookie: {},
        resave: false,
        saveUninitialized: false,
        store: store
    })
)

// Import Mongoose Models
const User = require('./models/User');
const Stat = require('./models/Stat');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');



/* SERVER MAINTENANCE */

app.get('/status', async (req, res) => {
    console.log("GET '/'\n")
    res.status(200).json({
        status: server_status,
        uptime: process.uptime()
    })
});

/* AUTHENTICATION */

/**
 * Creates an Express Session with login, username, userID, admin privilages,
 * and verification privilages from a User JSON document.
 * @param {Request} req Express Request object
 * @param {JSON} user User JSON document from the MongoDB database
 */
const createSession = (req, user) => {
    req.session.login = true;
    req.session.userID = user._id;
    req.session.username = user.username;
    req.session.verified = user.verfied;
    req.session.admin = user.admin;
}

/**
 * Creates a JSON object that holds a user's login and privilage information.
 * @param {Boolean} login  User's login status. Default is false
 * @param {String} username User's username. Default is empty String
 * @param {Boolean} verified User's verification status. Default is false
 * @param {Boolean} admin User's admin privilages. Default is false
 * @returns JSON object
 */
const createUserInfo = (login = false, username = '', verified = false, admin = false) => {
    return {
        user: {
            login: login,
            username: username,
            verified: verified,
            admin: admin
        }
    }
}


app.get('/api/authenticate', async (req, res) => {
    console.log(`GET '/auth' ` + req.session.username)
    try {
        if (!req.session.login)
            return RequestErrors.handleCredentialsError(res);

        const user = await User.findById(req.session.userID)
        if (user) {
            createSession(req, user);
            const userInfo = createUserInfo(true, user.username, user.verified, user.admin);
            res.status(200).json({
                user_found: true,
                ...userInfo
            });
            console.log(`SUCCESS: User ${user.username} authenticated\n`);
        } else {
            req.session.destroy(() => {
                RequestErrors.handleUserQueryError(res);
            })
        }
    } catch (err) {
        handleServerError(res, err)
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`POST '/login' ${username}`)
    try {
        if (req.session.login) {
            var errors = { login: 'User already logged in' }
            res.status(400).json({ errors });
            return console.log('FAILED: User already logged in')
        } else if (!username || !password) {
            var errors = {
                username: (username ? '' : 'Please enter a username.'),
                password: (password ? '' : 'Please enter your password.')
            }
            res.status(400).json({ errors });
            return console.log('FAILED: Incorrectly formatted body');
        }

        const user = await User.findOne({ username })
        if (user) {
            let hashPassword = user.password;
            const isMatch = await bcrypt.compare(password, hashPassword);
            if (isMatch) {
                createSession(req, user);
                const userInfo = createUserInfo(true, user.username, user.verified, user.admin);
                res.status(200).json({
                    ...userInfo,
                    email: (!user.verified ? user.email : '')
                });
                return console.log(`SUCCESS: User logged in\n`);
            }
        }   // Else, if user not found or passwords don't match ...
        var errors = { login: 'Incorrect login information' }
        res.status(400).json({ errors })
        console.log(`FAILED: User not logged in\n`)
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});

app.post('/api/logout', async (req, res) => {
    let username = req.session.username;
    console.log(`POST '/logout' ${username}`);
    try {
        if (!req.session.login)
            return RequestErrors.handleCredentialsError(res);

        req.session.destroy(() => {
            res.status(200).json({ logout: true });
            console.log(`SUCCESS: User logged out\n`)
        })
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
})

app.post('/api/register', async (req, res) => {
    const { email, username, password } = req.body
    console.log(`POST '/register' ${username}`)
    try {
        const user = await User.create({ email, username, password });
        createSession(req, user);
        const userInfo = createUserInfo(true, user.username, user.verified, user.admin);
        res.status(201).json({
            ...userInfo,
            email: user.email
        });
        console.log(`SUCCESS: New ${username} user created\n`)
    } catch (err) {
        if (err.message.includes('duplicate key error') ||
            err.message.includes('User validation failed')) {
            RequestErrors.handleRegistrationErrors(res, err);
        } else {
            RequestErrors.handleServerError(res, err);
        }
    }
});



/* USERS */

// NOTE: Only requested from unverified users being logged in
// FIXME: Unauthorized message needs clarification
app.post('/users/:username/email-verification', async (req, res) => {
    const username = req.params.username;
    console.log(`POST '/email-verification' ${req.session.username}`);
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username.test(username) || req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res)
        }

        let token = crypto.randomBytes(16).toString('hex');
        const user = await User.findByIdAndUpdate(req.session.userID, { verification_token: token });
        if (!user)
            return RequestErrors.handleUserQueryError(res);

        const verification_email = mailer.createVerificationEmail(user.username, user.email, token);
        mailer.sendEmail(verification_email)
            .then(sent => {
                let emails_accepted = sent.accepted.length;
                mailer.registerSuccessfulEmail(emails_accepted)
                res.status(200).json({
                    sent: true,
                    message: `Email sent: ${sent.response}`
                })
                console.log(`SUCCESS: Verification email sent: \n${sent.response}`)
            })
            .catch(err => {
                var errors = {
                    sent: false,
                    message: `Email failed: ${err}`
                }
                res.status(500).json({ errors });
                console.log(`FAILED: Verification email failed: \n${err}`)
            });
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});

// FIXME: Unauthorized message needs clarification
app.post('/verify', async (req, res) => {
    console.log(`POST '/verify' ${req.session.username}`);
    const { token } = req.body;
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res)
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res)
        } else if (!token) {
            var errors = { token: 'Please enter a verification token' }
            res.status(400).json({ errors })
            return console.log('FAILED: Verification token not found\n')
        }

        const user = await User.findOneAndUpdate({
            username: req.session.username,
            verification_token: token
        }, { verified: true });
        if (!user) {
            var errors = { token: 'Incorrect token entered' }
            res.status(400).json({ errors })
            console.log(`FAILED: User ${req.session.username} token combination not found\n`)
        } else {
            req.session.verified = true;
            res.status(200).json({ verified: true });
            console.log(`SUCCESS: User ${req.session.username} verified\n`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});


/* STATS SYSTEM */


const server = app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}\n`)
    server_status = "UP"
});


process.on('SIGINT', () => {
    if (DB) {
        DB.close()
            .then(() => {
                server.close(() => {
                    console.log("\nDatabase instance disconnected. Server closed\n");
                    process.exit(0);
                })
            })
            .catch((err) => console.log(err))
    } else {
        server.close(() => {
            console.log("\nServer closed\n");
            process.exit(0);
        })
    }
});