import React from 'react';
import { useState, createContext } from 'react';

// Pages
import Home from './pages/Home.js';
import Stats from './pages/Stats.js';
import FoodReview from './pages/FoodReview.js';
import Profile from './pages/Profile.js';
import Login from './pages/Login.js';
import Registration from './pages/Registration.js';

//Routes
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.js';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' element={<RootLayout />}>
                <Route path='/' element={<Home />} />
                <Route path='/stats' element={<Stats />} />
                <Route path='/food-review' element={<FoodReview />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/login' element={<Login />} />
                <Route path='/registration' element={<Registration />} >
                </Route>
            </Route>

            <Route path='/registration' element={<RootLayout />}>
                <Route path='../login' element={<Login />} />
            </Route>
        </>
    )
);

export const CurrentUserContext= createContext(null)

export default function App() {
    const [currentUser, setCurrentUser] = useState({
        login: false,
        username: ""
    });
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