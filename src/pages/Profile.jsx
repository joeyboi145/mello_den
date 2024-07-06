import React from "react";
import UserInfo from "../components/UserInfo";
import UserReviews from "../components/UserReviews";
import '../styles/user-profile.css'

export default function Profile() {
    return (
        <>
            {/* <h1 className="highlight_title">User Profile</h1> */}

            <UserInfo />

            <div id='user_profile_stat'>
                <h2 className="blue_highlight">Today's Stat Check: </h2>
                <h2 id='user_stat_indicator'>Completed</h2>
            </div>
            
            <UserReviews />
        </>
    )
}