const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statSchema = mongoose.Schema({
    hydration_level: {type: Number, required: true},
    meals: {type: Number, required: true},
    sleep: {type: Number, required: true},
    suncreen: {type: Number, required: true},
    
    completed_by: {type: Schema.Types.ObjectID, ref: "userSchema", required: true},
    completion_time: {type: Date, default: new Date()},
    completed: {type: Boolean, default: false}
});

module.exports = mongoose.model('Stat', statSchema);