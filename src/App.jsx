import React, { useEffect } from 'react';
import { useState, createContext } from 'react';
import axios from 'axios'

// Pages
import Home from './pages/Home';
import Stats from './pages/Stats';
import FoodReview from './pages/FoodReview';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Verification from './pages/Verification';
// import ChangeLog from './pages/ChangeLog';
// import Password from './pages/Password';

//Routes
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout';

export const backend_port = '1111'
export let protocol = 'http'
export let domain = 'localhost'
if (process.env.NODE_ENV === 'production') {
    protocol = 'https'
    domain = 'mello-den.org';
}
export const server = axios.create({
    baseURL: `${protocol}://${domain}:${backend_port}`,
    timeout: 5000,
    withCredentials: true
})
export const emptyUser = {
    login: false,
    username: "",
    verified: false,
    admin: false
}
export const emptyNotification = {
    display: false,
    message: '',
    error: false
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<RootLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/stats' element={<Stats />} />
            <Route path='/food-review' element={<FoodReview />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/registration' element={<Registration />} />
            <Route path='/verification' element={<Verification />} />
            {/* <Route path='/change-log' element={ <ChangeLog />} />
            <Route path='/password' element={<Password />} /> */}
        </Route>
    )
);

export const CurrentUserContext = createContext(null)
export const LoadingContext = createContext(null);
export const ServerContext = createContext(null);
export const NotificationContext = createContext(null);

export default function App() {
    // When app first renders, it is in a loading state
    // Therefore, loading = true
    const [loading, setLoading] = useState(true);
    // When app first renders, it doesn't know if the backend server is up
    // Therefore, serverDown = null
    const [serverDown, setServerDown] = useState(null);
    const [notification, setNotification] = useState({ ...emptyNotification })
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