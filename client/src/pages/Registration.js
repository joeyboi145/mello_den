import React, { useContext, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from 'axios'
import { CurrentUserContext } from "../App";

const { isEmail } = require('validator');
const server = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 5000,
    withCredentials: true
})

const empty_user = {
    email: "",
    username: "",
    password: "",
    confirm_password: ""
}

export default function Registration() {
    const { setCurrentUser } = useContext(CurrentUserContext);
    const [newUser, setNewUser] = useState({ ...empty_user });
    const [errors, setErrors] = useState({ ...empty_user });
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target
        setNewUser(prevData => {
            return {
                ...prevData,
                [name]: value
            }
        })
    }

    function setError(error, message = '') {
        setErrors(prevErrors => {
            return {
                ...prevErrors,
                [error]: message
            }
        });
    }

    // FIXME: Needs memoization
    function validate() {
        setErrors({ ...empty_user })
        let errorFlag = false

        if (!newUser.email) {
            setError('email', 'Please enter an email')
            errorFlag = true
        }
        if (newUser.email && !isEmail(newUser.email)) {
            setError('email', 'Email must be a valid email address')
            errorFlag = true
        }
        if (!newUser.username) {
            setError('username', 'Please enter a username')
            errorFlag = true
        }
        if (!newUser.password) {
            setError('password', 'Please enter a password')
            errorFlag = true
        }
        if (newUser.password.length < 8) {
            setError('password', 'Minimum password length is 8 characters')
            errorFlag = true
        }
        if (!newUser.confirm_password && newUser.password) {
            setError('confirm_password', 'Please confirm your password')
            errorFlag = true
        }
        if ((newUser.password && newUser.confirm_password) && newUser.confirm_password !== newUser.password) {
            setError('confirm_password', "Passwords do not match")
            errorFlag = true
        }
        return !errorFlag
    }

    function submitRegistration(event) {
        event.preventDefault()
        if (!validate()) return

        server.post('/register', {
            email: newUser.email,
            username: newUser.username,
            password: newUser.password
        })
            .then(res => {
                let userInfo = res.data.user
                setCurrentUser(userInfo)
                navigate("/")
            })
            .catch(err => {
                console.log(err)
                try {
                    let serverErrors = err.response.data.errors
                    for (var error in serverErrors) {
                        let error_message = serverErrors[error]
                        if (error_message)
                            setError(error, error_message)
                    }
                } catch (newErr) {
                    console.log(err)
                }
            })
    }

    return (
        <>
            <h2 className='highlight_title'>Registration</h2>

            <p>Make an account today!</p>

            <form id='registration_form' className="user_form">
                <label className='peach_highlight' htmlFor="registration_username">Username: </label>
                <input id='registration_username'
                    type="text"
                    name='username'
                    onChange={handleChange} />
                {(errors && errors.username) &&
                    <p className="error_message" >{errors.username}</p>
                }

                <label className='peach_highlight form_input_margin' htmlFor="registration_email">Email: </label>
                <input id='registration_email'
                    type="text"
                    name='email'
                    onChange={handleChange} />
                {(errors && errors.email) &&
                    <p className="error_message" >{errors.email}</p>
                }

                <label className='peach_highlight form_input_margin' htmlFor="registration_password">Password: </label>
                <input id='registration_password'
                    type="password"
                    name='password'
                    onChange={handleChange} />
                {(errors && errors.password) &&
                    <p className="error_message" >{errors.password}</p>
                }

                <p id="registration_requirements">- Password must be 8 characters long</p>

                <label className='peach_highlight form_input_margin' htmlFor="registration_confirm_password">Confirm Password: </label>
                <input
                    id='registration_confirm_password'
                    type="password"
                    name='confirm_password'
                    onChange={handleChange} />
                {(errors && errors.confirm_password) &&
                    <p className="error_message">{errors.confirm_password}</p>
                }

                <button type="submit" className="submit_button" onClick={submitRegistration} >Register</button>
            </form>

            <p style={{ fontSize: '20px' }}> OR </p>

            <div id='registration_login' className="center user_form_reminders">
                <p className='peach_highlight' >Already Have an Account?</p>

                <NavLink to='../login' className="submit_button" >
                    Log in
                </NavLink>
            </div>

            <div className="spacer winner_box_top"></div>
        </>
    )
}