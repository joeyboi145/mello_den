import React, { useContext, useEffect, useState } from "react";
import { CurrentUserContext, LoadingContext, NotificationContext } from "../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from 'axios'

const server = axios.create({
    baseURL: 'http://194.113.74.65:3333',
    timeout: 5000,
    withCredentials: true
})


export default function Verification() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const { loading, setLoading } = useContext(LoadingContext);
    const { setNotification } = useContext(NotificationContext);
    const [searchParams] = useSearchParams();
    const URLusername = searchParams.get("username");
    const URLtoken = searchParams.get("token");
    const [sent, setSent] = useState(false);
    const [token, setToken] = useState(null)
    const [errors, setErrors] = useState({
        token: "",

    });
    const navigate = useNavigate();

    // On load...
    // FIXME : added loading screens here
    useEffect(() => {
        // // If user is not logged, you cannot send any of these requests
        // FIXME: Implement loading so redirects aren't instanaeous
        if (!currentUser.login) {
            const redirect = setTimeout(() => {
                setNotification({
                    display: true,
                    message: "Please log into verify",
                    error: false
                });
                navigate("../login");
            }, 5500)
            return () => clearTimeout(redirect);
        }

        if (currentUser.verified) {
            setNotification({
                display: true,
                message: "Already verified. Redirecting you to home",
                error: false
            });
            navigate("../");
        }

        // If URL is passed username and token queries, send verification request
        if (URLusername && URLtoken && !sent) {
            server.post(`/users/${URLusername}/verify`, { token: URLtoken })
                .then(res => {
                    console.log(res.data);
                    setCurrentUser(prevData => {
                        return {
                            ...prevData,
                            verified: true
                        }
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
            setSent(true);
            setLoading(true);
        } else if (!currentUser.verified) {
            requestVericationEmail(currentUser.username)
        }
    }, [URLusername, URLtoken, currentUser.login, currentUser.verified])


    function submitVerifcationToken(event) {
        event.preventDefault();
        let username = currentUser.username;
        server.post(`/users/${username}/verify`, { token })
            .then(res => {
                console.log(res.data);
                setCurrentUser(prevData => {
                    return {
                        ...prevData,
                        verified: true
                    }
                })
            })
            .catch(err => {
                console.log(err);
            })
    }

    function requestVericationEmail(username) {
        server.post(`/users/${username}/email-verification`)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <>
            Welcome to the Mello family!!

            We've sent you an email to EMAIL to verfy your account.

            Please click the link in the email, or enter the verification token below:

            <form id='verification_form'>
                <input type="text"
                    id="verification_token"
                    name="token"
                    onChange={(event) => setToken(event.value)} />
                <input type="submit" onClick={submitVerifcationToken} />
            </form>


            Haven't recieved anything yet? We'll send another email by clicking here.
        </>
    )
}