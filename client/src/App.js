import React from 'react';

// Pages
import Home from './pages/Home.js';
import Stats from './pages/Stats.js';
import FoodReview from './pages/FoodReview.js';
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
                <Route path='/login' element={<Login />} />
                <Route path='/registration' element={<Registration />} />
            </Route>

            {/* <Route path='/registration' element={<Layout />}>
                <Route path='/login' element={<Login />} />
            </Route> */}
        </>
    )
)


export default function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}