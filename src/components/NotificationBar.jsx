import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../App";

export default function NotificationBar() {
    const { notification, setNotification } = useContext(NotificationContext)
    const [animationClass, setAnimationClass] = useState('notification-in');

    const color = notification.error ? '#f4d8b9' : '#D7CFCD';

    useEffect(() => {
        const animate = setTimeout(() => {
            setAnimationClass("notification-out")
        }, 4000);
        const remove = setTimeout(() => {
            setNotification({
                display: false,
                message: '',
                error: false
            });
        }, 5000)
        return () => {
            clearTimeout(animate)
            clearTimeout(remove)
        }
    }, [notification.display]);

    return (
        <div className={`notification ${animationClass}`}
            style={{ backgroundColor: color }}>
            <p>{notification.message}</p>
        </div>
    );

}