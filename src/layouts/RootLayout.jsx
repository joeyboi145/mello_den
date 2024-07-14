import React, { useContext } from "react";

import Banner from '../components/Banner';
import { Outlet } from "react-router-dom";
import { LoadingContext, NotificationContext, ServerContext } from "../App";
import Loader from "../components/Loader";
import ServerDown from "../pages/ServerDown";
import NotificationBar from "../components/NotificationBar";

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
                <div style={{
                    position: 'fixed',
                    bottom: '0',
                    right: '0',
                    padding: '10px',
                    color: 'lightgray'
                }}>v0.1.0</div>
            </>
        )
    }
}