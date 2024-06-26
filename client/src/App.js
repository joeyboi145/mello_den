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
export const ServerContext = createContext(server)

export default function App() {
    const [currentUser, setCurrentUser] = useState({
        login: false,
        username: "",
        verified: false,
        admin: false
    });

    function authenticate() {
        console.log("AUTHENTICATING...")
        if (!currentUser.login) {
            server.get('/api/authenticate')
                .then((response) => setCurrentUser(response.data.user))
                .catch(async err => {
                    console.log(err); 
                });
        }
    }

    authenticate();
    return (
        <CurrentUserContext.Provider
            value={{
                currentUser,
                setCurrentUser
            }}
        >
            <RouterProvider router={router} />
        </CurrentUserContext.Provider>
    );
}