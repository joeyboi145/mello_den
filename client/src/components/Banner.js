import React from 'react'
import logo from '../images/Mello_Den_Logos_GRY.png';

import { useState } from 'react';
import { NavLink } from 'react-router-dom'




export default function Banner() {

    return (
        <div id='banner'>
            <NavLink to='/' id='logo_div'>
                <img id='logo' src={logo} alt='The Mello Den'></img>
            </NavLink>
            <div id='menu' className='center'>
                <NavLink to='stats' className='peach_highlight'>Stat Check</NavLink>
                <NavLink to='food-review' className='peach_highlight'>Food Review</NavLink>
            </div>

            <div id='banner_user_div'>
                <div id='banner_user' className='center'>
                    <NavLink to='profile' className="center">Z</NavLink>
                    <button id='banner_logout_button' 
                        className='peach_highlight center banner_button'>Logout</button>
                </div>

                {/* <div id='banner_login'>
                    <NavLink to='login' id='banner_login_button' 
                        className='peach_highlight center banner_button'>
                        Login
                    </NavLink>
                    <NavLink to='registration' id='banner_signup_button' 
                        className='peach_highlight center banner_button'>
                        Sign Up
                    </NavLink>
                </div> */}
            </div>
        </div>
    )
}