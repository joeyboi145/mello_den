import React from 'react'
import { useState, useEffect } from 'react';
import '../styles/stats-timer.css'

const SECOND = 1_000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const defineDeadline = () => {
    let date = new Date();
    return new Date(date - (date % DAY) + DAY);
}

export default function StatTimer() {
    const [deadline, setDeadline] = useState(defineDeadline())
    const [timespan, setTimespan] = useState(new Date(deadline) - Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (deadline - Date.now() < 0) {
                let newDeadline = defineDeadline();
                setDeadline(newDeadline);
                setTimespan(new Date(newDeadline - Date.now()));
            } else setTimespan(new Date(deadline - Date.now()));
        }, 1_000);

        return () => {
            clearInterval(intervalId);
        };
    });

    return (
        <>
            <div className='spacer winner_box_top'></div>
            <div id='stat_timer_section'>
                <p> The Next Winner will be chosen in:</p>
                <div id='stat_timer'>
                    <div id='stat_timer_hours'>
                        {Math.max(0, Math.floor(timespan / HOUR))}
                    </div>

                    <div id='stat_timer_minutes'>
                        {Math.max(0, Math.floor((timespan / MINUTE) % 60))}
                    </div>

                    <div id='stat_timer_seconds'>
                        {Math.max(0, Math.floor((timespan / SECOND) % 60))}
                    </div>
                </div>

            </div>
        </>
    )
}