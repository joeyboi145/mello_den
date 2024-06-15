
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
// const cors = require('cors')
const bcrypt = require('bcrypt')
const mongoURI = "mongodb://localhost/mello_den";
const app = express();
const PORT = 3333;

mongoose.connect(mongoURI);
const DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'MongoDB connection error:'));

const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'sessions'
})

app.use(express.json())
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

const User = require('./models/User');
const Stat = require('./models/Stat');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');



// handle errors
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
            req.session.user = user.username
            req.session.userID = user._id
            const userInfo = {
                userID: user._id,
                username: user.username,
                admin: user.admin
            }
            res.status(200).json({ userInfo });
            console.log(`SUCCESS: User logged in\n`);
        } else {
            res.status(400).json({ errors: { login: 'Incorrect login information' } })
            console.log(`FAILED: User not logged in\n`)
        }
    }
});

// FIXME:  Investigate req.session.destory return value
app.post('/logout', (req, res) => {
    let username = req.session.user
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
    console.log("POST '/register'")
    const { email, username, password } = req.body
    try {
        const user = await User.create({ email, username, password })
        res.status(201).json({ user })
        console.log(`SUCCESS: New ${username} user created\n`)

    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
        console.log(`FAILED: New user ${username} NOT created\n`)
    }
});

app.get('/isAuth', (req, res) => {
    console.log(`GET '/auth' ` + req.session.user)
    if (req.session.userID) {
        User.findById(req.session.userID)
            .then(user => res.send({
                login: true,
                user: {
                    userID: user._id,
                    username: user.username,
                    admin: user.admin
                }
            }))
            .catch(err => res.send(err))
    } else res.send({ logn: false, user: {} })
})




const server = app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}\n`)
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