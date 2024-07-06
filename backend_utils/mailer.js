const nodemailer = require('nodemailer');
const DAY = 1_000 * 60 * 60 * 24;


/**
 * A class that represents a server Gmail account, which sents emails using Nodemailer 
 * and maintains the Gmail email limit.
 */
class ServerMailer {
    static DAILY_EMAIL_LIMIT = 5;

    /**
     * 
     * @param {String} serverEmail server's gmail address
     * @param {String} serverPass server's gmail account app password
     */
    constructor(serverEmail, serverPass) {
        if (!serverEmail) throw new Error('Server email cannot be empty or null');
        if (!serverPass) throw new Error('Server password cannot be empty or null');
        if (!serverEmail.endsWith("gmail.com")) throw new Error('Server email must be a Gmail account');

        this.email = serverEmail;
        this.transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: serverEmail,
                pass: serverPass,
            },
        });

        var date = new Date();
        this.day = new Date(date - (date % DAY));
        this.emails_sent = 0;
        this.email_queue = [];
    }

    /**
     * @returns the number of emails sent in total today
     */
    get_emails_sent() {
        return this.emails_sent
    }

    /** 
     * @returns the number of emails able to send today
     */
    get_emails_left() {
        return ServerMailer.DAILY_EMAIL_LIMIT - this.emails_sent;
    }

    /**
     * Creates a verification email personalized for an unverified user.
     * @param {String} username username of the unverified user 
     * @param {String} userEmail email address of unverified user
     * @param {String} token verification token 
     * @returns JSON object that contained all of the information required for a verification email
     */
    createVerificationEmail(username, userEmail, token) {
        return {
            from: this.email,
            to: userEmail,
            subject: "Mello Den Verification",
            text:

`Hi ${username},

Welcome to the Mello Den!

Your verifcation code is:\t${token}

Or go to the following link below: 
        https://mello-den.org/verification?token=${encodeURI(token)}

If this email was sent by mistake, please send an email back or submit a feedback form.

A Fellow Mello
`

        };
    }

    /**
     * Registers the amount of emails successfully sent in the ServerMailer object 
     * in order to maintain track of email count and prevent hitting the limit
     * @param {Number} count the amount of emails successfully sent
     */
    registerSuccessfulEmail(count) {
        var date = new Date();
        var today = new Date(date - (date % DAY));
        if (today > this.day) {
            this.emails_sent = 0;
            this.day = today;
            this.emailOutQueue();
        }
        this.emails_sent += count;
        console.log('Emails left today:' + this.get_emails_left());
    }


    /**
     * Mails out any queued emails 
     */
    emailOutQueue(){
        this.email_queue.forEach( email => {
            this.sendEmail(email)
                .then(response => {
                    let emails_accepted = response.accepted.length;
                    mailer.registerSuccessfulEmail(emails_accepted);
                    console.log(`Email sent: ${sent.response}`)
                })
                .catch(err => {
                    this.email_queue.push(email)
                    console.log(err)
                })
        })
    }


    /**
     * Sends mail using the server's Gmail account.
     * @param {JSON} mail JSON object containing the email options and information
     * @returns a JSON object which states if the message was successfully sent
     */
    sendEmail(mail) {
        if (this.emails_sent < ServerMailer.DAILY_EMAIL_LIMIT) {
            return this.transporter.sendMail(mail);
        } else {
            this.email_queue.push(mail);
            return new Error(`Email limit hit for ${this.email}`)
        }
    }
}

module.exports = ServerMailer;



