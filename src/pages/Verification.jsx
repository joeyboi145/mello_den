import React, { useContext, useEffect, useRef, useState } from "react";
import { CurrentUserContext, LoadingContext, NotificationContext } from "../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import { server } from '../App';
import { createNotification } from "../utils/functions";
import '../styles/verification.css'

let notification = {}

export default function Verification() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const { loading, setLoading } = useContext(LoadingContext);
    const { setNotification } = useContext(NotificationContext);
    const [searchParams] = useSearchParams();
    const URLtoken = searchParams.get("token");
    const [sent, setSent] = useState(false);
    const [token, setToken] = useState("______");
    const [tokenError, setTokenError] = useState("");
    const navigate = useNavigate();
    const inputRefs = [ useRef(null), useRef(null), useRef(null), 
                        useRef(null), useRef(null), useRef(null)    ]

    // On load...
    useEffect(() => {
        if (!loading) setLoading(true);

        // If user is not logged, you cannot send any of these requests. Redirect to login
        if (!currentUser.login) {
            let message = "Please log in to verify"
            notification = createNotification(message)
            setNotification(notification)
            setLoading(false)
            navigate("../login")
        }

        // If user is verified, no need to verify again. Redirect home
        if (currentUser.verified) {
            let message = "Already verified. Redirecting you to home"
            notification = createNotification(message)
            setNotification(notification);
            setLoading(false);
            navigate("../")
        }

        // If URL is passed with a token queries, 
        // and user logged in, and send verification request
        if (currentUser.login && URLtoken && !sent) {
            submitVerifcationToken(URLtoken);
            if (loading) setLoading(false)
        }
        setLoading(false)
    }, [URLtoken, currentUser.login, currentUser.verified])


    function submitVerifcationToken(token) {
        if (!currentUser.login)
            throw new Error("Cannot verify account if user is not logged in.")

        setSent(true);
        if (!loading) setLoading(true);
        let username = currentUser.username;
        server.post(`/users/${username}/verify`, { token: token })
            .then(() => {
                setCurrentUser(prevData => {
                    return {
                        ...prevData,
                        verified: true
                    }
                });
                setLoading(false);
                setSent(false);
            })
            .catch(err => {
                if (err.code === "ERR_BAD_REQUEST" ||
                    err.code === "ERR_BAD_RESPONSE") {
                    let serverErrors = err.response.data.errors
                    if (serverErrors.token) {
                        setTokenError(serverErrors.token)
                    } else {
                        let errorMessages = "";
                        for (var error in serverErrors) errorMessages += serverErrors[error] + "\n"
                        notification = createNotification(errorMessages, true);
                        setNotification(notification);
                    }
                } else {
                    console.log(err);
                    let message = 'Server Error. Try again later'
                    notification = createNotification(message, true);
                    setNotification(notification);
                }
                setLoading(false);
                setSent(false);
            });
    }

    function requestVericationEmail() {
        if (!currentUser.login)
            throw new Error("Cannot sent verification email if user is not logged in.")

        if (!loading) setLoading(true);
        let username = currentUser.username
        server.post(`/users/${username}/email-verification`)
            .then(res => {
                console.log(res.data)
                let message = "Email sent!"
                notification = createNotification(message);
                setNotification(notification)
                setLoading(false)
            })
            .catch(err => {
                if (err.code === "ERR_BAD_REQUEST" ||
                    err.code === "ERR_BAD_RESPONSE") {
                    let serverErrors = err.response.data.errors
                    let errorMessages = "";
                    for (var error in serverErrors) errorMessages += serverErrors[error] + "\n"
                    notification = createNotification(errorMessages, true);
                    setNotification(notification);

                } else {
                    console.log(err);
                    let message = 'Server Error. Try again later'
                    notification = createNotification(message, true);
                    setNotification(notification);
                }
                setLoading(false);
            })
    }


    function handleTokenSubmit() {
        if (!token) return setTokenError("Please enter a verification token")
        if (token.indexOf('_') !== -1) return setTokenError("Token must be 6 characters long")
        submitVerifcationToken(token)
    }

    function getTokenValueAt(index) {
        let char = token.slice(index, index + 1)
        if (char === "_") return ""
        else return char
    }

    function handleTokenInput(event, index) {
        const { value } = event.target
        let letter = value.slice(value.length - 1);

        let lastIndex = token.indexOf('_');
        if (lastIndex === -1) index = 5;

        if (letter === "") {
            setToken(prevToken => prevToken.slice(0, index) + "_" + prevToken.slice(index + 1))
            if (index > 0) inputRefs[index - 1].current.focus()
        } else {
            if (lastIndex >= 0) index = lastIndex
            setToken(prevToken => prevToken.slice(0, index) + letter.toUpperCase() + prevToken.slice(index + 1, 6))
            if (index < inputRefs.length - 1) inputRefs[index + 1].current.focus()
        }
    }

    function handleTokenKeyDown(event, index) {
        if (event.keyCode === 8 && !getTokenValueAt(index)) {
            let lastIndex = token.indexOf('_');
            if (lastIndex === -1) index = 5;

            if (index > 0) inputRefs[index - 1].current.focus()
            else inputRefs[index].current.focus()
        } else if (event.keyCode === 13) {
            handleTokenSubmit();
        }
    }


    if (currentUser.verified) return
    return (
        <>
            <p className="center highlight_title">
                Verify Account
            </p>
            <p className='verification-description'>
                We've sent you an email to verfy your account.
                Please click the link in the email, or enter the verification token below:
            </p>

            <form id='verification_form'>
                <div id="verification_token_box">
                    {inputRefs.map((ref, index) => {
                        return <input className="token-number peach_highlight"
                            type="text"
                            ref={ref}
                            key={index}
                            value={getTokenValueAt(index)}
                            onChange={(e) => handleTokenInput(e, index)}
                            onKeyUp={(e) => handleTokenKeyDown(e, index)}
                        />
                    })}
                </div>

                {tokenError &&
                    <p className="error_message">{tokenError}</p>
                }

                <input
                    id="submit_token_button"
                    type="submit"
                    value="Verify"
                    className="submit_button"
                    onClick={(event) => {
                        event.preventDefault();
                        handleTokenSubmit();
                    }} />
            </form>

            <br></br>

            <div className="centered-text-box">
                <p>Haven't recieved anything yet?</p>
                <p>We'll send another email by</p>
                <button id="send_email_button" 
                    className="peach_highlight"
                    onClick={requestVericationEmail}>clicking here</button>
            </div>

            <br></br><br></br>
        </>
    )
}