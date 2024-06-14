const mongoose = require('mongoose');
const Schema = mongoose.Schema;;

const announcementSchema = new Schema({
    written_by: {type: Schema.Types.ObjectID, required: true},
    time_written: {type: Date, default: new Date()},
    text: {type: String, required: true}
});

module.exports = mongoose.model('Announcement', announcementSchema);