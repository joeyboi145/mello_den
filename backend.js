// Import Modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const ServerMailer = require('./src/utils/mailer.js');
const crypto = require('node:crypto')
const bcrypt = require('bcrypt');
const RequestErrors = require('./src/utils/RequestErrors.js')

// Declare server variables
// Check Commandline Arguments
const userArgs = process.argv.slice(2);
if (userArgs.length !== 2) return console.log('ERROR: Incorrect number of arguments')
console.log("\nArguments:", userArgs);

const SERVER_PASS = userArgs[0];
const SESSION_SECRET = userArgs[1];
const domain = 'mello_den.org'
const PORT = 3333;
const mongoURI = `mongodb://server:${SERVER_PASS}@localhost/mello_den?authSource=admin`;
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
const mailer = new ServerMailer("melloden5058@gmail.com", SERVER_PASS);

// Store User Sessions
const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'sessions'
})

// Middleware
app.use(express.json())
app.use(cors({
    origin: `http://mello-den.org`,
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
            maxAge: 24 * 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Import Mongoose Models
const User = require('./src/models/User.js');
const StatForm = require('./src/models/StatForm.js');
const Announcement = require('./src/models/Announcement.js');
const Event = require('./src/models/Event.js');
const EmailRecord = require('./src/models/EmailRecord.js')
const VerificationToken = require('./src/models/VerificationToken.js');


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
        const userInfo = createUserInfo(true, user.username, user.verified, user.admin);
        res.status(201).json({
            ...userInfo,
            email: user.email,
        });
        console.log(`SUCCESS: New ${username} user created\n`);

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

const ableToSendEmail = async (user, res) => {
    const record = await EmailRecord.findOne({ user: user._id });
    if (record) { 
        if (record.count <= 0) {
            Request.handleEmailLimitError(res);
            return false
        } else {
            await EmailRecord.findByIdAndUpdate(record._id, { count: record.count - 1 });
            return record
        }
    } else {
        const newRecord = await EmailRecord.create({ user: user._id });
        return newRecord;
    }
}

const ableToVerify = async (user, res) => {
    const tokenRecord = await VerificationToken.findOne({ user: user._id });
    if (tokenRecord) {
        if (tokenRecord.tries <= 0) {
            RequestErrors.handleVerifyLimitError(res);
            return false;
        } else {
            await VerificationToken.findByIdAndUpdate(tokenRecord._id, { tries: tokenRecord.tries - 1 });
            return tokenRecord;
        }
    } else {
        RequestErrors.handleExpiredVerificationError(res);
        return false;
    }
}

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

        const user = await User.findOne({ username })
        if (!user) return RequestErrors.handleUserQueryError(res);
        if (!ableToSendEmail(user, res)) return

        let token = crypto.randomBytes(3).toString('hex').toUpperCase();
        await VerificationToken.create({ user: user._id, token });
        const verification_email = mailer.createVerificationEmail(username, user.email, token);
        mailer.sendEmail(verification_email)
            .then(sent => {
                let emails_accepted = sent.accepted.length;
                mailer.registerSuccessfulEmail(emails_accepted)
                res.status(200).json({
                    sent: true,
                    email: user.email,
                    message: `Email sent: ${sent.response}`,
                })
                console.log(`SUCCESS: Verification email sent: \n${sent.response}\n`)
            })
            .catch(err => {
                var errors = {
                    sent: false,
                    email: user.email,
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

        const user = await User.findOne({ username })
        if (!user) return RequestErrors.handleUserQueryError(res);
        let tokenRecord = await ableToVerify(user, res);
        if (!tokenRecord) return

        if (tokenRecord.token === token) {
            await User.findByIdAndUpdate(user._id, { verified: true })
            req.session.verified = true;
            req.session.save();
            res.status(200).json({ verified: true });
            console.log(`SUCCESS: User ${username} verified\n`)
        } else {
            var errors = { token: 'Incorrect token entered' }
            res.status(400).json({ errors })
            console.log(`FAILED: User ${username} token combination not found\n`)
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

async function createNewUser(username, email, pass = 'password') {
    let user = await User.create({
        username: username,
        email: email,
        password: pass
    });
    return user
}

async function createNewStatForm(userID, date) {
    return await StatForm.create({
        hydration_level: parseInt(Math.random() * 3),
        meals: {
            meal_1: false,
            meal_2: false,
            breakfast: false
        },
        sleep: parseInt(Math.random() * 8),
        sunscreen: parseInt(Math.random() * 10),
        done_by: userID,
        done_at: date
    })
}

function getMealScore(form) {
    let score = 0;
    if (form.meals.meal_1) score += 20;
    if (form.meals.meal_2) score += 20;
    if (form.meals.breakfast) score += 1;
    return score
}

function getTotalScore(form) {
    let score = (form.hydration_level * 2) + getMealScore(form)
        + (form.sleep * 3)
        + (form.sunscreen * 2)
    return score
}

function determineWinner(winner_form, username, score) {
    if (score > winner_form.score) {
        return {
            username: username,
            score: score
        }
    } else if (score === winner_form.score) {
        return {
            username: winner_form.username + ", " + username,
            score: score
        }
    } else return winner_form
}

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
        let totalScore = getTotalScore(form);
        stat_winner = determineWinner(stat_winner, form.user.username, totalScore);
        hydration_winner = determineWinner(hydration_winner, form.user.username, form.hydration_level);
        sleep_winner = determineWinner(sleep_winner, form.user.username, form.sleep);
        sunscreen_winner = determineWinner(sunscreen_winner, form.user.username, form.sunscreen);
    })
    return {
        stat_winner,
        hydration_winner,
        sleep_winner,
        sunscreen_winner
    }
}

app.get('/stats/winners', async (req, res) => {
    let day = null
    if (!req.params.day) day = new Date()
    else day = new Date(req.params.day);
    console.log(`GET '/stats/winner?day=${day.toString()}'`)
    try {
        let winners = await getStatWinners(day);
        res.status(200).json(winners);
        console.log(`SUCCESS: Winners calculated for ${day.toString()}\n`)
    } catch (err) {
        RequestErrors.handleServerError(res, err)
    }
});


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
        const statForm = await StatForm.findOne({
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
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await findUser(username);
        const prevStatForm = await StatForm.findOne({
            done_by: user._id,
            done_at: {
                $gt: deadline - DAY,
                $lt: deadline
            }
        });

        if (prevStatForm) {
            if (!prevStatForm.complete) {
                await StatForm.findOneAndUpdate({
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
            await StatForm.create({
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
            return RequestErrors.handleUnverifiedError(res);
        }

        checkDeadline();
        const user = await findUser(username)
        const deleteCount = await StatForm.deleteOne({
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
});