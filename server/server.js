const ServerMailer = require('./mail.js');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoURI = "mongodb://localhost/mello_den";
const PORT = 3333;
const app = express();
let server_status = "DOWN"

// Check Commandline Arguments
let userArgs = process.argv.slice(2);
if (userArgs.length !== 1) {
    console.log('ERROR: Incorrect number of arguments')
    return
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
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
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


// Handle Registration Errors
const handleErrors = (err) => {
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
    return errors
}

/* SERVER MAINTENANCE */
app.get('/', async (req, res) => {
    console.log("GET '/'\n")
    res.status(200).json({
        status: server_status,
        uptime: process.uptime()
    })
})

/* AUTHENTICATION */
app.get('/auth', async (req, res) => {
    console.log(`GET '/auth' ` + req.session.username)
    try {
        if (req.session.login) {
            const user = await User.findById(req.session.userID)
            if (user !== null) {
                res.status(200).json({
                    login: true,
                    username: user.username,
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
        var errors = { server: 'Server Error. Try again later' }
        res.status(500).json({ errors })
        server_status = 'WARNING';
        console.log(`FAILED: Server error...\n`, err)
    }
});

// NOTE: Creates session data
// FIXME: Added verified data to 200 OK response and session
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`POST '/login' ${username}`)
    try {
        if (req.session.login) {
            var errors = { login: 'User already logged in' }
            res.status(400).json({ errors });
            console.log('FAILED: User already logged in')
            return 
        } else if (!username || !password) {
            var errors = {
                username: (username ? '' : 'Please enter a username.'),
                password: (password ? '' : 'Please enter your password.')
            }
            res.status(400).json({ errors });
            console.log('FAILED: Incorrectly formatted body');
            return
        }

        const user = await User.findOne({ username })
        if (user === null) {
            var errors = { user: 'User not found' }
            res.status(400).json({ errors })
            console.log(`FAILER: User ${username}`)
            return
        }
        let hashPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashPassword);
        if (isMatch) {
            // Create session
            req.session.login = true;
            req.session.userID = user._id;
            req.session.username = user.username;
            res.session.verified = user.verified;
            res.status(200).json({
                login: true,
                username: user.username,
                admin: user.admin,
                verified: user.verified
            });
            console.log(`SUCCESS: User logged in\n`);
        } else {
            var errors = { login: 'Incorrect login information' } 
            res.status(400).json({ errors })
            console.log(`FAILED: User not logged in\n`)
        }
    } catch (err) {
        var errors = { server: 'Server Error. Try again later' };
        res.status(500).json({ errors });
        server_status = 'WARNING';
        console.log(`FAILED: Server error...\n`, err);
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
        var errors = { server: 'Server Error. Try again later' };
        res.status(500).json({ errors });
        server_status = 'WARNING';
        console.log(`FAILED: Server error...\n`, err);
    }
})

// FIXME: Refactor '/email-verification' to work with '/register'
// FIXME: handle format errors and function failures differently
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body
    console.log(`POST '/register' ${username}`)
    try {
        await User.create({ email, username, password })
        res.status(201).json({
            user: {
                username,
                email
            }
        });
        console.log(`SUCCESS: New ${username} user created\n`)

        // FIXME: Refactor '/email-verification' to work with '/register'
        req.body = { username };
        res.redirect('/email-verification');

    // FIXME: handle format errors and function failures differently
    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
        console.log(`FAILED: New user ${username} NOT created\n`)
    }
});

// NOTE: Only requested from unverified users being logged in
app.post('/email-verification', async (req, res) => {
    const { username } = req.body
    console.log(`POST '/email-verification' ${username}`);
    try {
        const user = await User.findOne({ username });
        let email = user.email;
        let token = null;
        if (user.verified) {
            token = user.token;
        } else {
            // FIXME: token creation system
        }

        const verification_email = mailer.createVerificationEmail(username, email, token)
        mailer.sendEmail(verification_email)
            .then(response => {
                let emails_accepted = response.accepted.length;
                mailer.registerSuccessfulEmail(emails_accepted)
                console.log('Emails left today:' + mailer.get_emails_left());
                console.log(`Email sent: ${sent.response}`)
                res.status(200).json({
                    sent: true,
                    message: `Email sent: ${sent.response}`
                })
            })
            .catch(err => {
                console.log(err)
                res.status(200).json({
                    sent: true,
                    message: err
                })
            });
    } catch (err) {
        console.log(err);
    }
});

app.get('/verify', async (req, res) => {
    const { username, token } = req.query;
    console.log('Username', username);
    console.log('Token.', token)
    res.status(200).json({
        username,
        verify: true
    })

    try {
        const user = User.findOneAndUpdate({ username, password }, { verfied: true })
        console.log(user)
    } catch (err) {
        console.log(err)
    }

})




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