import React, { useContext } from "react";

import Banner from '../components/Banner.js';
import { Outlet } from "react-router-dom";
import { LoadingContext, NotificationContext, ServerContext } from "../App.js";
import Loader from "../components/Loader.js";
import ServerDown from "../pages/ServerDown.js";
import NotificationBar from "../components/NotificationBar.js";

export default function RootLayout() {
    const { loading } = useContext(LoadingContext);
    const { serverDown } = useContext(ServerContext);
    const { notification } = useContext(NotificationContext);

    let awaiting_authentication = (serverDown === null && loading);
    let awaiting_response = (serverDown === false && loading);
    let server_error = (serverDown && !loading)

    if (awaiting_authentication) {
        return <Loader color='#333333' />
    } else {
        return (
            <>
                {awaiting_response &&
                    <Loader color="rgba(33, 33, 33, 0.3)" />
                }
                <Banner />
                <main>
                    {server_error &&
                        <ServerDown />
                    }
                    {!server_error &&
                        <Outlet />
                    }
                </main>
                {notification.display &&
                    <NotificationBar />
                }
            </>
        )
    }
}