const { Logger } = require('./loggers');


module.exports = {

    handleServerError: (res, err) => {
        var errors = { server: 'Server Error. Try again later' };
        res.status(500).json({ errors });
        Logger.error(`FAILED: Server error...\n${err.stack}\n(${res._id})`)
    },

    /**
     * Sends a 400 Bad Request response to the client indicating
     * that a request was sent without any credentials. 
     * @param {Response} res Express Response object
     */
    handleCredentialsError:  (res) => {
        var errors = { credentials: 'No credentials found. Please log in.' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: No credentials sent, (${res._id})`)
    },

    /**
     * Sends a 401 Unauthorized response to the client indicating
     * that a request was sent without proper authorization. 
     * @param {Response} res Express Response object
     */
    handleAuthorizationError: (res) => {
        var errors = { authorization: 'Missing proper authorization to perform request. Same user or admin privilages required' }
        res.status(401).json({ errors })
        Logger.warn(`FAILED: Unauthorized request, (${res._id})\n`);
    },

    handleAdminAuthorizationError: (res) => {
        var errors = { authorization: 'Missing proper authorization to perform request. Admin privilages required.'}
        res.status(401).json({ errors })
        Logger.warn(`FAILED: Unauthorized request, (${res._id})\n`);
    },

    /**
     * Sends a 500 Internal Server Error response to client indicating 
     * that a user was not found in the database.
     * @param {Response} res Express Response object
     */
    handleUserQueryError: (res) => {
        var errors = { user: "User not found. Try registering" }
        res.status(500).json({ errors });
        Logger.warn(`FAILED: User not found, (${res._id})`)
    },

    /**
     * Takes a user registration error and sends out a 400 Bad Request response
     * to the client depending on the type of error raised.
     * @param {Response} res Express Response object
     * @param {Error} err Error object raised by user registration
     */
    handleRegistrationErrors: (res, err) => {
        Logger.warn(`${err.message} ${err.code} ${res._id}`);
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
        Logger.warn(`FAILED: New user NOT created, (${res._id})`)
    },

    handleChangeLogError: (res, err) => {
        Logger.warn(`${err.message} ${err.code} ${res._id}`);
        let errors = { version: '', title: '', description: '', text: '' }

        // Validation errors
        if (err.message.includes('ChangeLog validation failed')) {
            Object.values(err.errors).forEach(({ properties }) => {
                errors[properties.path] = properties.message;
            })
        }
        res.status(400).json({ errors });
        Logger.warn(`FAILED: New change log NOT created, (${res._id})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating that the
     * requesting user is already verified and can't request a resources. 
     * @param {Response} res Express Response object
     */
    handleVerificationError: (res) => {
        var errors = { verified: 'User already verified' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User already verified, (${res._id})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating that the
     * requesting user is NOT verified and can't request a resources. 
     * @param {Response} res Express Response object
     */
    handleUnverifiedError: (res) => {
        var errors = { unverified: 'User is not verified' }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User is not verified, (${res._id})`)
    },

    /**
     * Sends a 400 Bad Request response to client indicating formatting/validation
     * errors, depending on the type of error raised
     * @param {Response} res Express Response object
     * @param {Error} err Error object raised by Stat creation/updating
     */
    handleStatFormError: (res, err) => {
        Logger.warn(`${err.message} ${err.code} (${res._id})`)
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
        Logger.warn(`FAILED: Unable to updating/creating Stat form, (${res._id})`)
    },


    handleEmailLimitError: (res) => {
        var errors = { email: "Unable to send email. User has reached email request limit. Try again in a couple of hours."}
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to send email due to limit, (${res._id})`)
    },

    handleVerifyLimitError: (res) => {
        var errors = { verification: "Unable to verify user. User has reached verification limit for this code. Try requesing a new verification code" }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to verify due to limit, (${res._id})`)
    },

    handleExpiredVerificationError: (res) => {
        var errors = { verification: "Unable to verify user. Verification code has expired. Request a new verification code through email" }
        res.status(400).json({ errors })
        Logger.warn(`FAILED: User unable to verify due to limit, (${res._id})`)
    }

}