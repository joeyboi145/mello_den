import React from "react";

import { NavLink } from "react-router-dom";

export default function Login(){
    return (
        <>
            <h2 className='highlight_title'>Login</h2>

            <form id='login_form' className="user_form">
                <label htmlFor="login_username" className="peach_highlight">Username:</label>
                <input type='text' id='login_username' name='login_username'/>

                <label htmlFor="login_password" className="peach_highlight form_input_margin">Password:</label>
                <input type='text' id='login_password' name='login_password'/>

                <button type="submit" className="submit_button">Login</button>

            </form>

            <p style={{fontSize: '20px'}}> OR </p>

            <div id='login_registration' className="center user_form_reminders">
                <p className='peach_highlight' >Don't have an account?</p>

                <NavLink to='../Registration' className="submit_button" >
                    Sign Up
                </NavLink>
            </div>

            <div className="spacer winner_box_top"></div>
        </>
    );
}