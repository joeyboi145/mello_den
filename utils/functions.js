const RequestErrors = require('./request_errors.js')
const { Logger } = require('./loggers.js')
const User = require('../models/User.js');
const StatForm = require('../models/StatForm.js');
const Announcement = require('../models/Announcement.js');
const Event = require('../models/Event.js');
const EmailRecord = require('../models/EmailRecord.js')
const VerificationToken = require('../models/VerificationToken.js');
const DAY = 1_000 * 60 * 60 * 24;


const stringifyTabObject = (object, depth = 1) => {
    let message = "\n"
    for (prop in object) {
        if ((typeof object[prop]) === "object") {
            message += '\t'.repeat(depth) + prop + ': ' + stringifyTabObject(object[prop], depth + 1) + "\n"
        } else
            message += '\t'.repeat(depth) + prop + ': ' + object[prop] + "\n"
    }
    return message
}

module.exports = {
    calculateDeadline: () => {
        let date = new Date();
        return new Date(date - (date % DAY) + DAY);
    },

    createSession: (req, user) => {
        req.session.login = true;
        req.session.userID = user._id;
        req.session.username = user.username;
        req.session.verified = user.verfied;
        req.session.admin = user.admin;
    },

    createUserInfo: (login = false, username = '', verified = false, admin = false) => {
        return {
            user: {
                login: login,
                username: username,
                verified: verified,
                admin: admin
            }
        }
    },

    ableToSendEmail: async (user, res) => {
        const record = await EmailRecord.findOne({ user: user._id });
        if (record) {
            Logger.info(`... Email record found. ${record.count} emails left, (${res._id})`)
            if (record.count <= 0) {
                RequestErrors.handleEmailLimitError(res);
                return false
            } else {
                await EmailRecord.findByIdAndUpdate(record._id, { count: record.count - 1 });
                Logger.info(`... Email record updated to have ${record.count - 1} emails left, (${res._id})`)
                return record
            }
        } else {
            const newRecord = await EmailRecord.create({ user: user._id });
            Logger.info(`... No email record found. Created a new one with ${newRecord.count} emails left, (${res._id})`)
            return newRecord;
        }
    },

    // FIXME: can make this faster by passing token into function
    ableToVerify: async (user, res) => {
        const tokenRecord = await VerificationToken.findOne({ user: user._id });
        if (tokenRecord) {
            Logger.info(`... Token record found. ${tokenRecord.tries} tries left, (${res._id})`)
            if (tokenRecord.tries <= 0) {
                RequestErrors.handleVerifyLimitError(res);
                return false;
            } else {
                await VerificationToken.findByIdAndUpdate(tokenRecord._id, { tries: tokenRecord.tries - 1 });
                Logger.info(`... Token record updated to have ${tokenRecord.tries - 1} tries left, (${res._id})`)
                return tokenRecord;
            }
        } else {
            RequestErrors.handleExpiredVerificationError(res);
            return false;
        }
    },

    getScore: (statForm) => {
        let score = (statForm.hydration_level * 2)
            + (statForm.sleep * 3)
            + (statForm.sunscreen * 2)
        if (statForm.meals.meal_1) score += 20;
        if (statForm.meals.meal_2) score += 20;
        if (statForm.meals.breakfast) score += 1;
        return score
    },

    findUser: async (username)  => {
        let user = await User.findOne({ username });
        if (!user) throw new Error("User not found");
        else return user
    },
    
    createNewUser: async (username, email, pass = 'password') => {
        let user = await User.create({
            username: username,
            email: email,
            password: pass
        });
        return user
    },

    createNewStatForm: async (userID, data) => {
        return await StatForm.create({
            hydration_level: parseInt(Math.random() * 3),
            meals: {
                meal_1: false,
                meal_2: false,
                breakfast: false
            },
            sleep: parseInt(Math.random() * 8),
            sunscreen: parseInt(Math.random() * 10),
            done_by: userID,
            done_at: date
        })
    },

    stringifyTabObject: (object, depth = 1) => stringifyTabObject(object, depth),

    determineWinner: (winner_form, username, score) => {
        if (score > winner_form.score) {
            return {
                username: username,
                score: score
            }
        } else if (score === winner_form.score) {
            return {
                username: winner_form.username + ", " + username,
                score: score
            }
        } else return winner_form
    },

}