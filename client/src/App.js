import React, { useEffect } from 'react';
import { useState, createContext } from 'react';
import axios from 'axios'

// Pages
import Home from './pages/Home.js';
import Stats from './pages/Stats.js';
import FoodReview from './pages/FoodReview.js';
import Profile from './pages/Profile.js';
import Login from './pages/Login.js';
import Registration from './pages/Registration.js';
import Verification from './pages/Verification.js';

//Routes
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.js';

const server = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 5000,
    withCredentials: true
})

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' element={<RootLayout />}>
                <Route path='/' element={<Home />} />
                <Route path='/stats' element={<Stats />} />
                <Route path='/food-review' element={<FoodReview />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/login' element={<Login />} />
                <Route path='/registration' element={<Registration />} />
                <Route path='/verification' element={<Verification />} />
            </Route>
        </>
    )
);

export const CurrentUserContext = createContext(null)
export const LoadingContext = createContext(null);
export const ServerContext = createContext(null);
export const NotificationContext = createContext(null);

const emptyUser = {
    login: false,
    username: "",
    verified: false,
    admin: false
}

export default function App() {
    // Once page renders, it is in a loading state
    // Therefore, loading = true
    const [loading, setLoading] = useState(true);
    // Once page renders, it doesn't know if the backend server is up
    // Therefore, serverDown = null
    const [serverDown, setServerDown] = useState(null);
    const [notification, setNotification] = useState({
        display: false,
        message: '',
        error: false
    })
    const [currentUser, setCurrentUser] = useState({ ...emptyUser });

    useEffect(() => {
        console.log("AUTHENTICATING...")
        if (!currentUser.login) {
            if (!loading) setLoading(true);
            server.get('/api/authenticate')
                .then((res) => {
                    setCurrentUser(res.data.user);
                    setServerDown(false);
                    setLoading(false);
                })
                .catch(async err => {
                    if (err.code === "ERR_NETWORK") {
                        setServerDown(true);
                    } else if (err.code === "ERR_BAD_REQUEST" ||
                        err.code === "ERR_BAD_RESPONSE") {
                        setCurrentUser({ ...emptyUser });
                        setServerDown(false);
                    }
                    setLoading(false);
                });
        }
    }, [currentUser.login])

    return (
        <ServerContext.Provider
            value={{
                serverDown, setServerDown
            }}>
            <CurrentUserContext.Provider
                value={{
                    currentUser, setCurrentUser
                }}>
                <LoadingContext.Provider
                    value={{
                        loading, setLoading
                    }}>
                    <NotificationContext.Provider
                        value={{
                            notification, setNotification
                        }}>
                        <RouterProvider router={router} />
                    </NotificationContext.Provider>
                </LoadingContext.Provider >
            </CurrentUserContext.Provider >
        </ServerContext.Provider>
    );
}