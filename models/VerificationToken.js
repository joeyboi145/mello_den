const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectID,
        ref: "userSchema",
        required: [true, "Please provide a User document ID"]
    },
    token: { 
        type: String, 
        required: [true, "Please enter a token"]
    },
    tries: { type: Number, default: 10 },
    createdAt: { 
        type: Date, 
        expires: 300, // 5 minutes in seconds
        default: Date.now() 
    } 
});

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);