import React from "react";

import { NavLink } from "react-router-dom";

export default function Registration() {
    return (
        <>
            <h2 className='highlight_title'>Registration</h2>

            <p>Make an account today!</p>

            <form id='registration_form' className="user_form">
                    <label className='peach_highlight' htmlFor="registration_username">Username: </label>
                    <input id='registration_username' type="text"></input>

                    <label className='peach_highlight' htmlFor="registration_email">Email: </label>
                    <input id='registration_email' type="text" />

                    <label className='peach_highlight' htmlFor="registration_password">Password: </label>
                    <input id='registration_password' type="text" />

                    <p id="registration_requirements">PASSWORD REQUIREMENTS</p>

                    <label className='peach_highlight' htmlFor="registration_confirm_password">Confirm Password: </label>
                    <input id='registration_confirm_password' type="text" />

                    <input type="submit" className="submit_button" text='Register'/>
            </form>

            <p style={{fontSize: '20px'}}> OR </p>

            <div id='registration_login' className="center user_form_reminders">
                <p className='peach_highlight' >Already Have an Account?</p>

                <NavLink to='../login' className="submit_button" >
                    Log in
                </NavLink>
            </div>

            <div className="spacer winner_box_top"></div>
        </>
    )
}