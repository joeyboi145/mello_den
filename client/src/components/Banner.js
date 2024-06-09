import React from 'react'
import logo from '../images/Mello_Den_Logos_GRY.png';

import { NavLink } from 'react-router-dom'

export default function Banner() {
    return (
        <div id='banner'>
            <NavLink to='/' id='logo_div'>
                <img id='logo' src={logo} alt='The Mello Den'></img>
            </NavLink>
            <div id='menu'>
                <NavLink to='stats'><b>Stat Check</b></NavLink>
                <NavLink to='food-review'><b>Food Review</b></NavLink>
            </div>
            <div id='banner_user_div'>
                <div id='banner_user'>
                    <NavLink to='registration'>Z</NavLink>
                </div>
            </div>
        </div>
    )
}