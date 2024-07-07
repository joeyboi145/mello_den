
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

/**
 * 
 * @param {*} form 
 * @returns 
 */
export function getMealScore(form) {
    let score = 0;
    if (form.meals.meal_1) score += 20;
    if (form.meals.meal_2) score += 20;
    if (form.meals.breakfast) score += 1;
    return score
}

export function getTotalScore(form) {
    let score = (form.hydration_level * 2) + getMealScore(form)
        + (form.sleep * 3)
        + (form.sunscreen * 2)
    return score
}

export function checkNoWhiteSpace(str) {
    return !(/\s/).test(str)
}
