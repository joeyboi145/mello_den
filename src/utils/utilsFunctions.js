

/**
 * Creates a JSON object that holds all of the required information for a
 * notification to display.
 * @param {String} message the message to be presented to the user
 * @param {Boolean} isError indicates if the notification is an error notification. By default it is FALSE
 * @returns JSON
 */
export const createNotification = (message, isError = false) => {
    return {
        display: true,
        message: message,
        error: isError
    }
}