const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const changeLogSchema = new Schema({
    version: {
        type: String,
        required: [true, "Please provide version number for this change log"],
        validator: [str => str.test(/v\d+\.\d+.\d/),
        `Version number must be of the form 'v#.#.#'`]
    },
    title: {
        type: String,
        requied: [true, 'Please provide a title for this change log']
    },
    description: { type: String, default: '' },
    text: {
        type: String,
        required: [true, 'Please provide the changes']
    }
})

module.exports = new mongoose.model('ChangeLog', changeLogSchema)