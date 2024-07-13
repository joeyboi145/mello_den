const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const checkNoWhiteSpace = (str) => {
    return !(/\s/).test(str)
}

const userSchema = new Schema({
    // User Properties
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        validate: [checkNoWhiteSpace, "Username cannot have any whitespace."]
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minLength: [8, 'Minimum password length is 8 characters'],
        validate: [checkNoWhiteSpace, "Passwords cannot have any whitespace."]
    },
    verified: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },

    // User Qualities
    year: { type: Number, default: (new Date()).getFullYear() },

    // User Stats
    average_score: { type: Number, default: 0 },
    win_hydration: { type: Number, default: 0 },
    win_suncreen: { type: Number, default: 0 },
    win_breakfast: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

module.exports = mongoose.model("User", userSchema);