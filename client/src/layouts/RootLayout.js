import React from "react";

import Banner from '../components/Banner.js';
import { Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <>
            <Banner />
            <main>
                <Outlet />
            </main>
        </>
    )
}