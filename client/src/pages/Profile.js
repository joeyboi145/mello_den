import React from "react";

export default function Profile() {
    return (
        <>
            <section id='user_info'>
                <div id='user' className="center">
                    <div id='user_profile' className="center">
                        Z
                    </div>
                    <p id='profile_username'
                        className="peach_highlight center">
                        <b>Username</b>
                    </p>
                </div>

                <div id='user_stats'>
                    <table>
                        <tr>

                        </tr>
                    </table>
                </div>
            </section>

            <hr></hr>

            <div id='user_reviews'>No Reviews Left</div>
        </>
    )
}