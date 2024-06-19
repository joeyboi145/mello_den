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


/* AUTHENTICATION */

app.get('/', async (req, res) => {
    console.log("GET '/'\n")
    res.json({
        status: server_status,
        uptime: process.uptime()
    })
})

// FIXME: Check out already logged in case
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`POST '/login' ${username}`)
    const user = await User.findOne({ username })

    if (req.session.userID) {
        res.status(400).json({ errors: { login: 'User already logged in' } })
        console.log('FAILED: User already logged in\n')
    }
    if (user === null) {
        res.status(400).json({ errors: { login: 'User not found' } })
        console.log('FAILED: User not found\n')
    } else {
        let hashPassword = user.password
        const isMatch = await bcrypt.compare(password, hashPassword)
        if (isMatch) {
            req.session.username = user.username
            req.session.userID = user._id
            const login = {
                login: false,
                username: user.username
            }
            res.status(200).json({ login });
            console.log(`SUCCESS: User logged in\n`);
        } else {
            res.status(400).json({ errors: { login: 'Incorrect login information' } })
            console.log(`FAILED: User not logged in\n`)
        }
    }
});

// FIXME:  Investigate req.session.destory return value
app.post('/logout', async (req, res) => {
    let username = req.session.username
    console.log(`POST '/logout' ${username}`)
    if (req.session.userID) req.session.destroy(() => {
        res.status(200).json({ logout: true });
        console.log(`SUCCESS: User logged out\n`)
    })
    else {
        res.status(400).json({ errors: { logout: "No session found" } });
        console.log("FAILED: No session found\n");
    }
})

app.post('/register', async (req, res) => {
    const { email, username, password } = req.body
    console.log(`POST '/register' ${username}`)
    try {
        const user = await User.create({ email, username, password })
        res.status(201).json({
            user: {
                username, 
                email
            }
        });
        console.log(`SUCCESS: New ${username} user created\n`)

        const token = '123'
        const verification_email = mailer.createVerificationEmail(username, email, token)
        mailer.sendEmail(verification_email)
        .then(response => {
            let emails_accepted = response.accepted.length;
            mailer.registerSuccessfulEmail(emails_accepted)
            console.log('Emails left today:' + mailer.get_emails_left());
            console.log(`Email sent: ${sent.response}`)
        })
        .catch(err => {
            console.log(err)
        })

    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
        console.log(`FAILED: New user ${username} NOT created\n`)
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
})

app.get('/auth', (req, res) => {
    console.log(`GET '/auth' ` + req.session.username)
    if (req.session.userID) {
        User.findById(req.session.userID)
            .then(user => res.status(200).json({
                login: true,
                username: user.username
            }))
            .catch(err => res.send(err))
    } else res.status(400).json({ errors: { login: false } })
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