import React, { useContext, useEffect, useState } from "react";
import { CurrentUserContext } from "../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from 'axios'

const server = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 5000
})


export default function Verification() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext)
    const [searchParams] = useSearchParams();
    const URLusername = searchParams.get("username");
    const URLtoken = searchParams.get("token");
    const [token, setToken] = useState(null)
    const [errors, setErrors] = useState({
        token: "",

    });
    const navigate = useNavigate();

    // On load...
    useEffect(() => {
        // // If user is not logged, you cannot send any of these requests
        // FIXME: Implement loading so redirects aren't instanaeous
        // if (!currentUser.login) navigate("../login")

        // console.log("username: ", URLusername)
        // console.log("token: ", URLtoken)
        // If URL is passed username and token queries, send verification request
        if (URLusername && URLtoken) {
            server.post(`/users/${URLusername}/verify`, { token: URLtoken })
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
        } else if (!currentUser.verified) {
            requestVericationEmail(currentUser.username)
        }
    }, [URLusername, URLtoken, currentUser, setCurrentUser])


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