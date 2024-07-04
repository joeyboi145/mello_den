import React, { useEffect, useState, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { CurrentUserContext, LoadingContext, NotificationContext } from '../App';
import { server } from '../App';
import '../styles/user-forms.css'
import { createNotification } from "../utils/utilsFunctions";

const empty_login = {
    username: "",
    password: ""
}

export default function Login() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const { setNotification } = useContext(NotificationContext);
    const { loading, setLoading } = useContext(LoadingContext);
    const [login, setLogin] = useState({ ...empty_login })
    const [errors, setErrors] = useState({ ...empty_login, login: "" });
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser.login) {
            setNotification({
                display: true,
                message: "Already logged in... Redirecting to home",
                err: false
            });
            navigate("../")
        }
    }, [currentUser.login])

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

        if (!loading) setLoading(true);
        server.post('/api/login', login)
            .then(res => {
                let userInfo = res.data.user
                setCurrentUser(userInfo)
                setLoading(false)
                navigate("/")
            }).catch(err => {
                if (err.code === "ERR_BAD_REQUEST" ||
                    err.code === "ERR_BAD_RESPONSE") {
                    let serverErrors = err.response.data.errors
                    if (serverErrors.username || serverErrors.password || serverErrors.login) {
                        let newErrors = {}
                        if (serverErrors.username) newErrors.username = serverErrors.username;
                        if (serverErrors.password) newErrors.password = serverErrors.password;
                        if (serverErrors.login) newErrors.login = serverErrors.login;
                        setErrors(prevErrors => {
                            return {
                                ...prevErrors,
                                ...newErrors
                            }
                        });
                    } else {
                        let errorMessages = "";
                        for (var error in serverErrors) errorMessages += serverErrors[error] + "\n"
                        var notification = createNotification(errorMessages, true);
                        setNotification(notification);
                    }
                    setLoading(false);
                } else {
                    console.log(err)
                    let message = 'Server Error. Try again later'
                    var notification = createNotification(message, true);
                    setNotification(notification);
                    setLoading(false);
                }
            })
    }

    return (
        <>
            <h2 className='highlight_title'>Login</h2>

            <form id='login_form' className="user_form">
                {(errors && errors.login) &&
                    <p className="error_message" >{errors.login}</p>
                }
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