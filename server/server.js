const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const ServerMailer = require('./mail.js');
const crypto = require('node:crypto')
const bcrypt = require('bcrypt');
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


/**
 * Sends out a 500 Internal Server Error response to the client
 * @param {Response} res Express Response object
 * @param {Error} err Error object raised
 */
const handleServerError = (res, err) => {
    var errors = { server: 'Server Error. Try again later' };
    server_status = 'WARNING';
    console.log(`FAILED: Server error...\n`, err);
    res.status(500).json({ errors });
}

/**
 * Takes a user registration error and sends out a 400 Bad Request response
 * to the client depending on the type of error raised
 * @param {Response} res Express Response object
 * @param {Error} err Error object raised by user registration
 */
const handleRegistrationErrors = (res, err) => {
    console.log(err.message, err.code)
    let errors = { email: '', username: '', password: '' }

    // Dupilcate Error
    if (err.code === 11000 && err.message.includes('index: email_1')) {
        errors.email = 'Email already registered'
    } else if (err.code === 11000 && err.message.includes('index: username_1')) {
        errors.username = 'Username already used'
    }

    // Validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    res.status(400).json({ errors });
    console.log(`FAILED: New user ${username} NOT created\n`)
}

/* SERVER MAINTENANCE */
app.get('/', async (req, res) => {
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
}

app.get('/auth', async (req, res) => {
    console.log(`GET '/auth' ` + req.session.username)
    try {
        if (req.session.login) {
            const user = await User.findById(req.session.userID)
            if (user !== null) {
                createSession(req, user);
                res.status(200).json({
                    login: true,
                    username: user.username,
                    verified: user.verified,
                    admin: user.admin
                });
                console.log(`SUCCESS: User ${user.username} authenticated\n`);
                return
            }
        }
        // If not session or user not found...
        var errors = { credentials: 'Credentials not found' }
        res.status(400).json({ errors })
        console.log(`FAILED: User not authenticated\n`)
    } catch (err) {
        handleServerError(res, err)
    }
});

// NOTE: Creates session data
app.post('/login', async (req, res) => {
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
        if (user === null) {
            var errors = { user: 'User not found' }
            res.status(400).json({ errors })
            return console.log(`FAILED: User ${username} no found`)
        }
        let hashPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashPassword);
        if (isMatch) {
            // Create session
            createSession(req, user);
            res.status(200).json({
                user: {
                    login: true,
                    username: user.username,
                    admin: user.admin,
                    verified: user.verified
                },
                email: (!user.verified ? user.email : '')
            });
            console.log(`SUCCESS: User logged in\n`);
        } else {
            var errors = { login: 'Incorrect login information' }
            res.status(400).json({ errors })
            console.log(`FAILED: User not logged in\n`)
        }
    } catch (err) {
        handleServerError(res, err);
    }
});

// NOTE: Destroys session data
app.post('/logout', async (req, res) => {
    let username = req.session.username;
    console.log(`POST '/logout' ${username}`);
    try {
        if (req.session.login) req.session.destroy(() => {
            res.status(200).json({ logout: true });
            console.log(`SUCCESS: User logged out\n`)
        })
        else {
            let errors = { credentials: "Credentials not found" }
            res.status(400).json({ errors });
            console.log("FAILED: No session found\n");
        }
    } catch (err) {
        handleServerError(res, err);
    }
})

// NOTE: Creates session data
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body
    console.log(`POST '/register' ${username}`)
    try {
        const user = await User.create({ email, username, password });
        createSession(req, user);
        res.status(201).json({
            user: {
                login: true,
                username: user.username,
                admin: user.admin,
                verified: user.verified
            },
            email: user.email
        });
        console.log(`SUCCESS: New ${username} user created\n`)
    } catch (err) {
        console.log(err.message)
        if (err.message.includes('duplicate key error') ||
            err.message.includes('User validation failed')) {
            handleRegistrationErrors(res, err);
        } else {
            handleServerError(res, err);
        }
    }
});

// NOTE: Only requested from unverified users being logged in
// FIXME: Unauthorized message needs clarification
app.post('/email-verification', async (req, res) => {
    console.log(`POST '/email-verification' ${req.session.username}`);
    if (!req.session.login) {
        var errors = { credentials: 'Credentials not found. Please log in' }
        res.status(401).json({ errors })
        return console.log('FAILED: No session found')
    } else if (req.session.verified) {
        var errors = { verified: 'User already verified' }
        res.status(400).json({ errors })
        return console.log('FAILED: User already verified')
    }

    try {
        let token = crypto.randomBytes(16).toString('hex');
        const user = await User.findByIdAndUpdate(req.session.userID, { verification_token: token });
        if (!user) {
            var errors = { user: 'User not found' }
            res.status(400).json({ errors })
            return console.log(`FAILED: User ${username} no found`)
        }

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
                res.status(400).json({
                    sent: false,
                    message: `Email failed: ${err}`
                });
                console.log(`FAILED: Verification email failed: \n${err}`)
            });
    } catch (err) {
        handleServerError(res, err);
    }
});

// FIXME: Unauthorized message needs clarification
app.get('/verify', async (req, res) => {
    console.log(`POST '/verify' ${req.session.username}`);
    const { token } = req.body;
    if (!req.session.login) {
        var errors = { credentials: 'Credentials not found. Please log in' }
        res.status(401).json({ errors })
        return console.log('FAILED: No session found')
    } else if (req.session.verified) {
        var errors = { verified: 'User already verified' }
        res.status(400).json({ errors })
        return console.log('FAILED: User already verified')
    } else if (!token) {
        var errors = { token: 'Please enter a verification token' }
        res.status(400).json({ errors })
        return console.log('FAILED: Verification token not found')
    }

    try {
        const user = await User.findOneAndUpdate({
            username: username,
            verification_token: token
        }, { verfied: true });
        if (!user) {
            var errors = { token: 'Incorrect token entered' }
            res.status(400).json({ errors })
            console.log(`FAILED: User ${username} token combination not found`)
        } else {
            res.status(200).json({ verified: true });
            console.log(`SUCCESS: User ${username} verified`)
        }
    } catch (err) {
        handleServerError(res, err);
    }
});




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