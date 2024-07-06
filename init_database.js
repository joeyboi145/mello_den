const mongoose = require('mongoose');

const userArgs = process.argv.slice(2);
if (userArgs.length !== 2) return console.log('ERROR: Incorrect number of arguments')
console.log("\nArguments:", userArgs);
const ADMIN_PASS = userArgs[0];
const ADMIN_EMAIL = userArgs[1];
const mongoURI = `mongodb://joey:${SERVER_PASS}@localhost/mello_den?authSource=admin`;

mongoose.connect(mongoURI);
const DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'MongoDB connection error:'));
DB.on('open', console.log("Connected to server...\n"));

const User = require('./src/models/User.js');
const StatForm = require('./src/models/StatForm.js');
const Announcement = require('./src/models/Announcement.js');
const Event = require('./src/models/Event.js');
const EmailRecord = require('./src/models/EmailRecord.js')
const VerificationToken = require('./src/models/VerificationToken.js');

await User.create({
    username: 'joey',
    password: ADMIN_PASS,
    email: ADMIN_EMAIL,
    verified: true,
    admin: true
});

