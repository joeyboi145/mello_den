import React, { useState } from "react"

const empty_password_data = {
    password: "",
    confirm_password: ""
}


export default function Password() {
    const [passwordData, setPasswordData] = useState({ ...empty_password_data })
    const [errors, setErrors] = useState({ ...empty_password_data })


    function handleChange(event) {
        const { name, value } = event.target;
        setPasswordData(prevData => {
            return {
                ...prevData,
                [name]: value
            }
        })
    }

    function validate() {
        let newErrors = { ...empty_password_data }
        if (!passwordData.password) newErrors.password = 'Please enter a password'
        if (!passwordData.password.length < 8) newErrors.password = "Minimum password length is 8 characters"
        if (!passwordData.confirm_password && passwordData.password) newErrors.confirm_password = 'Please confirm your password'
        return (!newErrors.password && !newErrors.confirm_password)
    }

    return (
        <>
            <h2 className="highlight_title">Reset Password</h2>

            <p>Enter a new password to reset your current password</p>

            <form id="change_password_form" className="user_form">
                <label htmlFor="password" className="peach_highlight">Password:</label>
                <input id='password'
                    type='password'
                    name='password'
                    value={passwordData.password}
                    onChange={handleChange}
                />

                <p className="input_requirements">- Password must be 8 characters long</p>

                <label htmlFor="confirm_password" className="peach_highlight form_input_margin">Confirm Password</label>
                <input id="confirm_password"
                    type='password'
                    name='confirm_password'
                    value={passwordData.confirm_password}
                    onChange={handleChange}
                />

                <button type='submit' className="submit_button">Reset Password</button>
            </form>
        </>
    )

}