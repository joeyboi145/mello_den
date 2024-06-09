import React from 'react';

// Components
import Banner from './components/Banner.js';

// Pages
import Home from './pages/Home.js';
import Stats from './pages/Stats.js';
import Registration from './pages/Registration.js';
import FoodReview from './pages/FoodReview.js';

//Routes
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Outlet } from 'react-router-dom'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={
            <>
                <Banner />
                <main>
                    <Outlet />
                </main>
            </>
        }>
            <Route path='/' element={<Home />}></Route>
            <Route path='/stats' element={<Stats />}></Route>
            <Route path='/registration' element={<Registration />}></Route>
            <Route path='/food-review' element={<FoodReview />}></Route>
        </Route>
    )
)


export default function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}