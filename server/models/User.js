const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // User Properties
    username: {type: String, require: true},
    email: {type: String, required: true},
    password: {type: String, required: true}, 
    verified: {type: Boolean, default: false},
    admin: {type: Boolean, default: false},
    
    // User Qualities
    year: {type: Number, default: (new Date()).getFullYear()},
    created_since: {type: Date, default: new Date()},

    // User Stats
    average_score: {type: Number, default: 0},
    win_hydration: {type: Number, default: 0},
    win_suncreen: {type: Number, default: 0},
    win_breakfast: {type: Number, default: 0}
});

module.exports = mongoose.model("User", userSchema);