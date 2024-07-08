const { Logger } = require('./loggers');


module.exports = {

    handleServerError: (res, err, reqID) => {
        var errors = { server: 'Server Error. Try again later' };
        res.status(500).json({ errors });
        Logger.error(`FAILED: Server error...\n${err.stack}\n(${reqID})`)
    },

    /**
     * Sends a 400 Bad Request response to the client indicating
     * that a request was sent without any credentials. 
     * @param {Response} res Express Response object
     */
    handleCredentialsError:  (res, reqID) => {
        var errors = { credentials: 'No credentials found. Please log in.' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: No credentials sent, (${reqID})`)
    },

    /**
     * Sends a 401 Unauthorized response to the client indicating
     * that a request was sent without proper authorization. 
     * @param {Response} res Express Response object
     */
    handleAuthorizationError: (res, reqID) => {
        var errors = { authorization: 'Missing proper authorization to perform request. Same user or admin privilages required' }
        res.status(401).json({ errors })
        Logger.warn(`FAILED: Unauthorized request, (${reqID})\n`);
    },

    /**
     * Sends a 500 Internal Server Error response to client indicating 
     * that a user was not found in the database.
     * @param {Response} res Express Response object
     */
    handleUserQueryError: (res, reqID) => {
        var errors = { user: "User not found. Try registering" }
        res.status(500).json({ errors });
        Logger.warn(`FAILED: User not found, (${reqID})`)
    },

    /**
     * Takes a user registration error and sends out a 400 Bad Request response
     * to the client depending on the type of error raised.
     * @param {Response} res Express Response object
     * @param {Error} err Error object raised by user registration
     */
    handleRegistrationErrors: (res, err, reqID) => {
        Logger.warn(`${err.message} ${err.code} ${reqID}`);
        let errors = { email: '', username: '', password: '' }

        // Dupilcate Error
        if (err.code === 11000 && err.message.includes('index: email_1')) {
            errors.email = 'Email already registered'
        } else if (err.code === 11000 && err.message.includes('index: username_1')) {
            errors.username = 'Username already used'
        }

        // Validation errors
        if (err.message.includes('User validation failed')) {
            Object.values(err.errors).forEach(({ properties }) => {
                errors[properties.path] = properties.message;
            })
        }
        res.status(400).json({ errors });
        Logger.warn(`FAILED: New user NOT created, (${reqID})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating that the
     * requesting user is already verified and can't request a resources. 
     * @param {Response} res Express Response object
     */
    handleVerificationError: (res, reqID) => {
        var errors = { verified: 'User already verified' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User already verified, (${reqID})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating that the
     * requesting user is NOT verified and can't request a resources. 
     * @param {Response} res Express Response object
     */
    handleUnverifiedError: (res, reqID) => {
        var errors = { unverified: 'User is not verified' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User is not verified, (${reqID})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating formatting/validation
     * errors, depending on the type of error raised
     * @param {Response} res Express Response object
     * @param {Error} err Error object raised by Stat creation/updating
     */
    handleStatFormError: (res, err, reqID) => {
        Logger.warn(`${err.message} ${err.code} (${reqID})`)
        console.log(err.message, err.code)
        let errors = {
            done_by: '',
            hydration_level: '',
            meal_1: '',
            meal_2: '',
            breakfast: '',
            sleep: '',
            suncreen: ''
        }

        // Validation errors
        if (err.message.includes('Stat validation failed')) {
            Object.values(err.errors).forEach(({ properties }) => {
                errors[properties.path] = properties.message;
            })
        }
        res.status(400).json({ errors });
        Logger.warn(`FAILED: Unable to updating/creating Stat form, (${reqID})`)
    },


    handleEmailLimitError: (res, reqID) => {
        var errors = { email: "Unable to send email. User has reached email request limit. Try again in a couple of hours."}
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to send email due to limit, (${reqID})`)
    },

    handleVerifyLimitError: (res, reqID) => {
        var errors = { verification: "Unable to verify user. User has reached verification limit for this code. Try requesing a new verification code" }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to verify due to limit, (${reqID})`)
    },

    handleExpiredVerificationError: (res, reqID) => {
        var errors = { verification: "Unable to verify user. Verification code has expired. Request a new verification code through email" }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to verify due to limit, (${reqID})`)
    }

}