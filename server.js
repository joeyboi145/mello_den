// Import Modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const ServerMailer = require('./src/utils/mailer.js');
const crypto = require('node:crypto')
const bcrypt = require('bcrypt');
const path = require('path');
const RequestErrors = require('./src/utils/RequestErrors.js')

// Declare server variables
// Check Commandline Arguments
let userArgs = process.argv.slice(2);
if (userArgs.length !== 2) {
    return console.log('ERROR: Incorrect number of arguments')
}
console.log("\nArguments:", userArgs);
const MAIL_PASS = userArgs[0];
const SESSION_SECRET = userArgs[1];
const domain = 'localhost'
const PORT = 3333;
const mongoURI = "mongodb://localhost/mello_den";
const app = express();
let server_status = "DOWN";

const DAY = 1_000 * 60 * 60 * 24;
var date = new Date();
let deadline = new Date(date - (date % DAY) + DAY);
console.log(date);

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
    origin: `http://${domain}`,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
}));
app.use(
    session({
        name: 'mello_session',
        secret: SESSION_SECRET,
        cookie: {
            name: 'mello_token',
            domain: domain,
            maxAge: 24 * 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Import Mongoose Models
const User = require('./src/models/User.js');
const Stat = require('./src/models/Stat.js');
const Announcement = require('./src/models/Announcement.js');
const Event = require('./src/models/Event.js');


// Front end hosting on port 80
const front = express();
front.use(express.static(
    path.join(__dirname, 'build')
));
const client = front.listen(80, () => {
    console.log(`\nFrontend listening on port 80`);
});

front.get('/*', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'build', 'index.html')
    );
});


/* Backend host on PORT */
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
    console.log(`GET '/auth' ${req.session.username}`);
    try {
        if (!req.session.login) return RequestErrors.handleCredentialsError(res);

        const user = await User.findById(req.session.userID)
        if (user) {
            // createSession(req, user);
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
        RequestErrors.handleServerError(res, err)
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
        if (!req.session.login) return RequestErrors.handleCredentialsError(res);

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
        // req.session.save()
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
app.post('/users/:username/email-verification', async (req, res) => {
    const username = req.params.username;
    console.log(`POST '/email-verification' ${username}`);
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && !req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res)
        }

        let token = crypto.randomBytes(16).toString('hex');
        const user = await User.findOneAndUpdate({ username }, { verification_token: token }, { projection: 'email' });

        if (!user) return RequestErrors.handleUserQueryError(res);

        const verification_email = mailer.createVerificationEmail(username, user.email, token);
        mailer.sendEmail(verification_email)
            .then(sent => {
                let emails_accepted = sent.accepted.length;
                mailer.registerSuccessfulEmail(emails_accepted)
                res.status(200).json({
                    sent: true,
                    message: `Email sent: ${sent.response}`
                })
                console.log(`SUCCESS: Verification email sent: \n${sent.response}\n`)
            })
            .catch(err => {
                var errors = {
                    sent: false,
                    message: `Email failed: ${err}`
                }
                res.status(500).json({ errors });
                console.log(`FAILED: Verification email failed: \n${err}\n`)
            });
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});


app.post('/users/:username/verify', async (req, res) => {
    const username = req.params.username;
    console.log(`POST '/verify' ${username}`);
    const { token } = req.body;
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (req.session.verified) {
            return RequestErrors.handleVerificationError(res);
        } else if (!token) {
            var errors = { token: 'Please enter a verification token' }
            res.status(400).json({ errors })
            return console.log('FAILED: Verification token not found\n')
        }

        const user = await User.findOneAndUpdate({
            username: username,
            verification_token: token
        }, { verified: true });
        if (!user) {
            var errors = { token: 'Incorrect token entered' }
            res.status(400).json({ errors })
            console.log(`FAILED: User ${username} token combination not found\n`)
        } else {
            req.session.verified = true;
            res.status(200).json({ verified: true });
            console.log(`SUCCESS: User ${username} verified\n`)
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});


/* STATS SYSTEM */

const checkDeadline = () => {
    if (new Date() > deadline) {
        var today = new Date();
        deadline = new Date(today - (today % DAY) + DAY);
    }
}

function getScore(statForm) {
    let score = (statForm.hydration_level * 2)
        + (statForm.sleep * 3)
        + (statForm.sunscreen * 2)
    if (statForm.meals.meal_1) score += 20;
    if (statForm.meals.meal_2) score += 20;
    if (statForm.meals.breakfast) score += 1;
    return score
}

async function findUser(username) {
    let user = await User.findOne({ username });
    if (!user) throw new Error("User not found");
    else return user
}


// FIXME: Add a date parameter
app.get('/stats/form/:username', async (req, res) => {
    let username = req.params.username;
    console.log(`GET '/stats/form/${username}'`);
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await findUser(username)
        const statForm = await Stat.findOne({
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
        } else {
            var errors = { form: "Form not found" }
            res.status(404).json({ errors });
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});

app.get('/stats/form/:username/check', async (req, res) => {
    let username = req.params.username;
    console.log(`POST '/stats/form/${username}/check'`);
    try {
        checkDeadline();
        const user = await findUser(username)
        const statForm = await Stat.findOne({
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
        } else {
            var errors = { form: "Form not found" }
            res.status(400).json({ errors });
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});

app.get('/stats/form/:username/score', async (req, res) => {
    let username = req.params.username;
    console.log(`POST '/stats/form/${username}/score'`);
    try {
        checkDeadline();
        const user = await findUser(username)
        const statForm = await Stat.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (statForm) {
            res.status(200).json({
                score: getScore(statForm)
            });
        } else {
            var errors = { form: "Form not found" }
            res.status(400).json({ errors });
        }
    } catch (err) {
        RequestErrors.handleServerError(res, err);
    }
});

app.post('/stats/form/:username', async (req, res) => {
    let username = req.params.username;
    let statForm = req.body
    console.log(`POST '/stats/form/${username}'`);
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverificationError(res);
        }

        checkDeadline();
        const user = await findUser(username);
        const prevStatForm = await Stat.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (prevStatForm) {
            if (!prevStatForm.complete) {
                await Stat.findOneAndUpdate({
                    ...statForm,
                    done_at: new Date()
                });
                res.status(200).json({ saved: true })
            } else {
                var errors = {
                    saved: false,
                    form: "Stat check form was already submitted and completed"
                }
                res.status(400).json({ errors })
            }
        } else {
            await Stat.create({
                ...statForm,
                done_by: user._id,
                done_at: new Date()
            });
            res.status(201).json({ saved: true })
        }

    } catch (err) {
        if (err.message.includes('Stat validation failed')) {
            RequestErrors.handleStatFormError(res, err);
        } else {
            RequestErrors.handleServerError(res, err);
        }
    }
});

app.delete('/stats/form/:username', async (req, res) => {
    let username = req.params.username;
    console.log(`POST '/stats/form/${username}'`);
    try {
        if (!req.session.login) {
            return RequestErrors.handleCredentialsError(res);
        } else if (req.session.username !== username && req.session.admin) {
            return RequestErrors.handleAuthorizationError(res);
        } else if (!req.session.verified) {
            return RequestErrors.handleUnverificationError(res);
        }

        checkDeadline();
        const user = await findUser(username)
        const deleteCount = await Stat.deleteOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (deleteCount === 1) res.status(200)
        else res.status(500)
        res.json({ deleted: deleteCount === 1 })
    } catch (err) {
        RequestErrors.handleServerError(res, err)
    }
});



const server = app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}\n`)
    server_status = "UP"
});
server.maxHeadersCount = 0;


process.on('SIGINT', () => {
    if (DB) {
        DB.close()
            .then(() => {
                server.close(() => {
                    console.log("\nDatabase instance disconnected. Backend closed\n");
                })
            })
            .catch((err) => console.log(err))
    } else {
        server.close(() => {
            console.log("\nBackend closed\n");
        })
    }

    client.close(() => {
        console.log('\nFrontend closed\n');
        process.exit(0);
    });
});