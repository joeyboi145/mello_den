const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MAX_HYDRATION_LEVEL = 10;
const MAX_SLEEP = 24;
const MAX_SUNSCREEN = 12;

const statFormSchema = mongoose.Schema({
    hydration_level: {
        type: Number,
        required: [true, "Please enter a hydration level."],
        validate: [val => (val >= 0 && val <= MAX_HYDRATION_LEVEL),
        `Hydration level can only be from a range of 0-${MAX_HYDRATION_LEVEL}`]
    },
    meals: {
        meal_1: {
            type: Boolean,
            required: [true, "Please indicate if you ate at your first meal of the day."]
        },
        meal_2: {
            type: Boolean,
            required: [true, "Please indicate if you are your second meal of the day."]
        },
        breakfast: {
            type: Boolean,
            required: [true,
                "Please indicate if your first meal is what you would consider your breakfast."]
        },
    },

    sleep: {
        type: Number,
        required: [true, "Please enter how many hours you slept last night."],
        validate: [val => (val >= 0 && val <= MAX_SLEEP),
        `Hours of sleep can only range from 0-${MAX_SLEEP}`]
    },

    sunscreen: {
        type: Number,
        required: [true, "Please enter the amount of times you have put sunscreen on today."],
        validate: [val => (val >= 0 && val <= MAX_SUNSCREEN),
        `Sunscreen application amount can only be in a range from 0-${MAX_SUNSCREEN}`]
    },

    done_by: {
        type: Schema.Types.ObjectID, ref: "userSchema",
        required: [true, "Please provide user credentials."]
    },
    done_at: { type: Date, default: new Date() },
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('StatForm', statFormSchema);