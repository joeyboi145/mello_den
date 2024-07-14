import { useContext, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { server, CurrentUserContext } from '../App';
import { getWindowDimensions } from '../utils/functions';
import logo from '../assets/mello_den_logo.png';
import '../styles/banner.css'

const emptyPageStyle = {
    stats: { textDecoration: 'none' },
    foodReview: { textDecoration: 'none' },
    changeLog: { textDecoration: 'none' }
}

export default function Banner() {
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const [dropdownMenu, setDropDownMenu] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [pageStyle, setPageStyle] = useState({ ...emptyPageStyle });
    const location = useLocation();

    function handleResize() {
        setWindowDimensions(getWindowDimensions());
    }

    useEffect(() => {
        if (location.pathname === '/stats') {
            setPageStyle({
                ...emptyPageStyle,
                stats: { textDecoration: 'underline' }
            })
        } else if (location.pathname === '/food-review') {
            setPageStyle({
                ...emptyPageStyle,
                foodReview: { textDecoration: 'underline' }
            })
        } else if (location.pathname === '/change-log') {
            setPageStyle({
                ...emptyPageStyle,
                changeLog: { textDecoration: 'underline' }
            })
        } else setPageStyle({ ...emptyPageStyle })

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [location]);

    function handleMenuClick(fromDropdown = false) {
        if (fromDropdown) {
            setDropDownMenu(prevData => {
                return !prevData
            })
        } else {
            if (dropdownMenu) setDropDownMenu(false);
        }
    }

    function submitLogout(event) {
        event.preventDefault()
        if (dropdownMenu) setDropDownMenu(false)

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

    function dropDownButtonStyle() {
        if (dropdownMenu) return { backgroundColor: 'rgba(0, 0, 0, 0.2)' }
        else return {}
    }

    return (
        <div id='banner'>
            <NavLink to='/' id='logo_div'>
                <img id='logo' src={logo}
                    alt='The Mello Den'
                    onClick={() => handleMenuClick()}
                ></img>
            </NavLink>
            <div id='menu' className='center'>
                {windowDimensions.width <= 700 &&
                    <div>
                        <svg id='dropdown_menu_button'
                            viewBox="0 0 50 50"
                            onClick={handleMenuClick}
                            style={dropDownButtonStyle()}
                        >
                            {/* M2 6h20v2H2z */}
                            <path d="M5 12h40v4H5z" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* M2 11h20v2H2z */}
                            <path d="M5 22h40v4H5z" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* M2 16h20v2H2z */}
                            <path d="M5 32h40v4H5z" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {/* M2 6h20v2H2zm0 5h20v2H2zm0 5h20v2H2z */}
                            <path d="M5 12h40v4H5zm0 10h40v4H5zm0 10h40v4H5z" fill="#FDCA90" />
                        </svg>
                        {dropdownMenu &&
                            <div id='dropdown_menu' className=''>
                                <NavLink to='stats'
                                    className=' dropdown_text_fade'
                                    style={pageStyle.stats}
                                    onClick={() => handleMenuClick(true)}
                                >Stat Check</NavLink>
                                <NavLink to='food-review'
                                    className=' dropdown_text_fade'
                                    style={pageStyle.foodReview}
                                    onClick={() => handleMenuClick(true)}
                                >Food Review</NavLink>
                                {/* <NavLink
                                    to='change-log'
                                    className=' dropdown_text_fade'
                                    style={pageStyle.changeLog}
                                    onClick={() => handleMenuClick(true)}
                                >Change Log</NavLink> */}
                            </div>
                        }
                    </div>
                }
                {windowDimensions.width > 700 &&
                    <>
                        <NavLink to='stats'
                            className='peach_highlight'
                            style={pageStyle.stats}
                            onClick={() => handleMenuClick()}
                        >Stat Check</NavLink>
                        <NavLink to='food-review'
                            className='peach_highlight'
                            style={pageStyle.foodReview}
                            onClick={() => handleMenuClick()}
                        >Food Review</NavLink>
                        {/* <NavLink 
                            to='change-log' 
                            className='peach_highlight' 
                            style={pageStyle.changeLog}
                            onClick={() => handleMenuClick()}
                        >Change Log</NavLink> */}
                    </>
                }
            </div>

            <div id='banner_user_div'>
                {(currentUser && currentUser.login) &&
                    <div id='banner_user' className='center'>
                        <NavLink to='profile'
                            className="center"
                            onClick={() => handleMenuClick()}>
                            {currentUser.username.slice(0, 1)}
                        </NavLink>
                        <button id='banner_logout_button' onClick={submitLogout}
                            className='peach_highlight center banner_button'>Logout</button>
                    </div>
                }

                {(currentUser == null || !currentUser.login) &&
                    <div id='banner_login'>
                        <NavLink to='login' id='banner_login_button'
                            className='peach_highlight center banner_button'
                            onClick={() => handleMenuClick()}>
                            Login
                        </NavLink>
                        <NavLink to='registration' id='banner_signup_button'
                            className='peach_highlight center banner_button'
                            onClick={() => handleMenuClick()}>
                            Sign Up
                        </NavLink>
                    </div>
                }
            </div>
        </div>
    )
}