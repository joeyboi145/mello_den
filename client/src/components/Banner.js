import React from 'react'
import logo from '../images/Mello_Den_Logos_GRY.png';
import axios from 'axios'

import { useContext } from 'react';
import { NavLink } from 'react-router-dom'
import { CurrentUserContext } from '../App';


const server = axios.create({
    baseURL: 'http://194.113.74.65:3333',
    timeout: 5000,
    withCredentials: true
})


export default function Banner() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    function submitLogout(event) {
        event.preventDefault()

        server.post('/api/logout')
            .then(res => {
                setCurrentUser({
                    login: false,
                    username: "",
                    verified: false,
                    admin: false
                })
            }).catch(err => {
                console.log(err)
            })
    }

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

                {(currentUser && currentUser.login) &&
                    <div id='banner_user' className='center'>
                        <NavLink to='profile' className="center">{currentUser.username}</NavLink>
                        <button id='banner_logout_button' onClick={submitLogout}
                            className='peach_highlight center banner_button'>Logout</button>
                    </div>
                }

                {(currentUser == null || !currentUser.login ) &&
                    <div id='banner_login'>
                        <NavLink to='login' id='banner_login_button'
                            className='peach_highlight center banner_button'>
                            Login
                        </NavLink>
                        <NavLink to='registration' id='banner_signup_button'
                            className='peach_highlight center banner_button'>
                            Sign Up
                        </NavLink>
                    </div>
                }
            </div>
        </div>
    )
}