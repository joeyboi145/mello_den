const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    written_by: {type: Schema.Types.ObjectId, required: true},
    time_written: {type: Date, default: new Date()},

    description: {type: String, required: true},
    attendance: {type: String, required: true},
    attire: {type: String, required: true},
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true}
});

module.exports = mongoose.model('Event', eventSchema);