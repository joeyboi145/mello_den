
/**
 * Sends a general 500 Internal Server Error response to the client
 * @param {Response} res Express Response object
 * @param {Error} err Error object raised
 */
const handleServerError = (res, err) => {
    var errors = { server: 'Server Error. Try again later' };
    server_status = 'WARNING';
    console.log(`FAILED: Server error...\n`, err);
    res.status(500).json({ errors });
}

/**
 * Sends a 400 Bad Request response to the client indicating
 * that a request was sent without any credentials. 
 * @param {Response} res Express Response object
 */
const handleCredentialsError = (res) => {
    var errors = { credentials: 'No credentials found. Please log in.' }
    res.status(400).json({ errors })
    console.log(`FAILED: No credentials sent\n`)
}

/**
 * Sends a 401 Unauthorized response to the client indicating
 * that a request was sent without proper authorization. 
 * @param {Response} res Express Response object
 */
const handleAuthorizationError = (res) => {
    var errors = { authorization: 'Missing proper authorization to perform request. Same user or admin privilages required' }
    res.status(401).json({ errors })
    console.log(`FAILED: Unauthorized request \n`)
}

/**
 * Sends a 500 Internal Server Error response to client indicating 
 * that a user was not found in the database.
 * @param {Response} res Express Response object
 */
const handleUserQueryError = (res) => {
    var errors = { user: "User not found. Try registering" }
    res.status(500).json({ errors });
    console.log(`FAILED: User not found\n`)
}

/**
 * Takes a user registration error and sends out a 400 Bad Request response
 * to the client depending on the type of error raised.
 * @param {Response} res Express Response object
 * @param {Error} err Error object raised by user registration
 */
const handleRegistrationErrors = (res, err) => {
    console.log(err.message, err.code)
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
    console.log(`FAILED: New user NOT created\n`)
}

/**
 * Sends a 400 Bad Request reponse to client indicating that the
 * requesting user is already verified and can't request a resources. 
 * @param {Response} res Express Response object
 */
const handleVerificationError = (res) => {
    var errors = { verified: 'User already verified' }
    res.status(400).json({ errors })
    console.log('FAILED: User already verified\n')
}


/**
 * Sends a 400 Bad Request reponse to client indicating that the
 * requesting user is NOT verified and can't request a resources. 
 * @param {Response} res Express Response object
 */
const handleUnverifiedError = (res) => {
    var errors = { unverified: 'User is not verified' }
    res.status(400).json({ errors })
    console.log('FAILED: User is not verified\n')
}

module.exports = {
    handleServerError,
    handleCredentialsError,
    handleAuthorizationError,
    handleUserQueryError,
    handleRegistrationErrors,
    handleVerificationError,
    handleUnverifiedError
};