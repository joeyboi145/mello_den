const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EMAIL_LIMIT = 5;

const emailRecordSchema = new Schema({
    user: {
        type: Schema.Types.ObjectID,
        ref: "userSchema",
        required: [true, "Please provide a User document ID"]
    },
    count: {
        type: Number,
        default: 5,
        validate: val => (val >= 0 && val <= EMAIL_LIMIT)
    },
    createdAt: {
        type: Date,
        expires: '12h', // 12 hours in seconds
        default: Date.now()
    }
});

module.exports = mongoose.model("emailRecord", emailRecordSchema);