const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    // User Properties
    username: {
        type: String, 
        required: [true, 'Please enter a username'],
        unique: true,
    },
    email: {
        type: String, 
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [ isEmail , 'Please enter a valid email']
    },
    password: {
        type: String, 
        required: [true, 'Please enter a password'],
        minLength: [8, 'Minimum password length is 8 characters']
    }, 

    verified: { type: Boolean, default: false },
    verification_token: {
        type: String,
        expires: '5m'
    },
    admin: { type: Boolean, default: false },
    
    // User Qualities
    year: { type: Number, default: (new Date()).getFullYear() },
    created_since: { type: Date, default: new Date() },

    // User Stats
    average_score: { type: Number, default: 0 },
    win_hydration: { type: Number, default: 0} ,
    win_suncreen: { type: Number, default: 0 },
    win_breakfast: { type: Number, default: 0 }
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

module.exports = mongoose.model("User", userSchema);