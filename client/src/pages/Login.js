import React, { useState } from "react";
import axios from 'axios'

import { useNavigate, NavLink } from "react-router-dom";
import { useContext } from "react";
import { CurrentUserContext } from '../App';

const server = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 5000
})

const empty_login = {
    username: "",
    password: ""
}

export default function Login() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const [login, setLogin] = useState({ ...empty_login })
    const [errors, setErrors] = useState({ ...empty_login });
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target
        setLogin((prevData) => {
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
        setErrors({ ...empty_login })
        let errorFlag = false

        if (!login.username) {
            setError('username', 'Please enter a username')
            errorFlag = true
        }
        if (!login.password) {
            setError('password', 'Please enter a password')
            errorFlag = true
        }
        return !errorFlag
    }


    function submitLogin(event) {
        event.preventDefault()

        if (!validate()) return

        server.post('/login', login)
            .then(res => {
                let user = res.data.login
                console.log(res.data)
                setCurrentUser({ user })
                navigate("/")

            }).catch(err => {
                console.log(err)

                // FIXME: is this the best implementation?
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
            <h2 className='highlight_title'>Login</h2>

            <form id='login_form' className="user_form">
                <label htmlFor="login_username" className="peach_highlight">Username:</label>
                <input id='login_username'
                    type='text'
                    name='username'
                    onChange={handleChange} />
                {(errors && errors.username) &&
                    <p className="error_message" >{errors.username}</p>
                }

                <label htmlFor="login_password" className="peach_highlight form_input_margin">Password:</label>
                <input id='login_password'
                    type='password'
                    name='password'
                    onChange={handleChange} />
                {(errors && errors.password) &&
                    <p className="error_message" >{errors.password}</p>
                }

                <button type="submit"
                    className="submit_button"
                    onClick={submitLogin}>Login</button>

            </form>

            <p style={{ fontSize: '20px' }}> OR </p>

            <div id='login_registration' className="center user_form_reminders">
                <p className='peach_highlight' >Don't have an account?</p>

                <NavLink to='../Registration' className="submit_button" >
                    Sign Up
                </NavLink>
            </div>

            <div className="spacer winner_box_top"></div>
        </>
    );
}