const mongoose = require('mongoose');
if (process.env.DEPLOYED !== 'true') require('dotenv').config()
const User = require('../models/User.js');

const userArgs = process.argv.slice(2);
if (userArgs.length !== 3) return console.log('ERROR: Incorrect number of arguments')
else if (userArgs[0] === '' || userArgs[0] === '' || userArgs[0] === '')
    return console.log('ERROR: Arguments cannot be empty')

console.log("\nArguments:", userArgs);
const ADMIN_USERNAME = userArgs[0]
const ADMIN_PASS = userArgs[1];
const ADMIN_EMAIL = userArgs[2];
const mongoURI = `mongodb://server:${process.env.SERVER_PASS}@localhost/mello_den?authSource=admin`;

const createAdmin = async () => {
    let admin = await User.create({
        username: ADMIN_USERNAME,
        password: ADMIN_PASS,
        email: ADMIN_EMAIL,
        verified: false,
        admin: true
    });
    console.log(admin);
}

mongoose.connect(mongoURI);
const DATABASE = mongoose.connection;
DATABASE.on('error', console.error.bind(console, 'MongoDB connection error:'));
DATABASE.on('open', () => {
    console.log('processing ...');
    createAdmin()
        .then(() => {
            console.log(`Admin ${ADMIN_USERNAME} created!`);
            DATABASE.close()
        })
        .catch((err) => {
            console.log("ERROR: " + err)
            DATABASE.close()
        })
});

