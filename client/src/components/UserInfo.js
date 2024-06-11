import React from "react";

export default function UserInfo() {
    return (
        <section id='user_info'>
            <div id='user' className="center">
                <div id='user_profile' className="center">
                    <div id='profile_picture' className="center">
                        Z
                    </div>

                    <p id='profile_username' className="blue_highlight center">
                        Username
                    </p>

                    <div id='profile_year_div' className="center">
                        <p style={{ marginRight: '10px' }} className="blue_highlight" >
                            SOSB Year:
                        </p>
                        <p id='profile_year' >First</p>
                    </div>

                    <button>
                        Edit Profile
                    </button>
                </div>
            </div>

            <div id='user_stats' >
                <h2 className="peach_highlight">User Stats</h2>

                <table style={{width: "100%"}}><tbody>
                    <tr className="user_stat_row">
                        <td>Average Stat Check Score:</td>
                        <td className="peach_highlight">95</td>
                    </tr>
                    <tr className="user_stat_row">
                        <td>Stat Check Forms Completed:</td>
                        <td className="peach_highlight">4</td>
                    </tr>
                    <tr className="user_stat_row">
                        <td>Times Won Most Hydrated:</td>
                        <td className="peach_highlight">1</td>
                    </tr>
                    <tr className="user_stat_row">
                        <td>Times Won Most Sunscreened:</td>
                        <td className="peach_highlight">2</td>
                    </tr>
                    <tr>
                        <td>Times Eaten Breakfast?:</td>
                        <td className="peach_highlight">3</td>
                    </tr>
                </tbody></table>
            </div>

            {/* <h2>Today's: Check?</h2> */}
        </section >
    )
}