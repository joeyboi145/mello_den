import React from "react"
import StatCheckForm from '../components/StatCheckForm.js';
import StatWinner from '../components/StatWinner.js';
import StatTimer from '../components/StatTimer.js';


export default function Stats() {
    return (
        <>
            <h2 id='stat_system_title'>Stat Check System</h2>
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
            <h2>Filled out your form today?</h2>
            <StatCheckForm/>
            <StatTimer/>
        </>
    )
}