import React from "react"
import StatCheckForm from '../components/StatCheckForm';
import StatWinner from '../components/StatWinner';
import StatTimer from '../components/StatTimer';
import StatCalendar from "../components/StatCalendar";


export default function Stats() {
    return (
        <>
            <h2 className="highlight_title">Stat Check System</h2>
            <p id='disclaimer'> THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                VTHIS IS A DISCLAIMER
                VV
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                VTHIS IS A DISCLAIMER
                VTHIS IS A DISCLAIME
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                THIS IS A DISCLAIMER
                VTHISV
            </p>

            <StatWinner/>
            {/* <StatCalendar /> */}

            <h2>Filled out your form today?</h2>
            <StatCheckForm/>
            <StatTimer/>
        </>
    )
}