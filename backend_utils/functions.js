
const User = require('../src/models/User.js');
const StatForm = require('../src/models/StatForm.js');
const Announcement = require('../src/models/Announcement.js');
const Event = require('../src/models/Event.js');
const EmailRecord = require('../src/models/EmailRecord.js')
const VerificationToken = require('../src/models/VerificationToken.js');
const DAY = 1_000 * 60 * 60 * 24;


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
            if (record.count <= 0) {
                Request.handleEmailLimitError(res);
                return false
            } else {
                await EmailRecord.findByIdAndUpdate(record._id, { count: record.count - 1 });
                return record
            }
        } else {
            const newRecord = await EmailRecord.create({ user: user._id });
            return newRecord;
        }
    },

    ableToVerify: async (user, res) => {
        const tokenRecord = await VerificationToken.findOne({ user: user._id });
        if (tokenRecord) {
            if (tokenRecord.tries <= 0) {
                RequestErrors.handleVerifyLimitError(res);
                return false;
            } else {
                await VerificationToken.findByIdAndUpdate(tokenRecord._id, { tries: tokenRecord.tries - 1 });
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

    determineWinner: async (winner_form, username, score) => {
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
    }

}