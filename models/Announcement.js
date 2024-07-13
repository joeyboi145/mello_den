const mongoose = require('mongoose');
const Schema = mongoose.Schema;;

const announcementSchema = new Schema({
    written_by: {
        type: Schema.Types.ObjectID,
        ref: "userSchema",
        required: [true, "Please provide a User document ID"]
    },
    text: {
        type: String, 
        required: [true, "Please provide annoucements text"]
    },
    type: {
        type: String, 
        required: [true, "Please provide annoucement type"]
    }
}, { timestamps: true } );

module.exports = mongoose.model('Announcement', announcementSchema);