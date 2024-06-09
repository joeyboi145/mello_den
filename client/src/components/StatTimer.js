import React from 'react'
import { useState, useEffect } from 'react';

const SECOND = 1_000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

let date = new Date();
let deadline = new Date(date - (date % DAY) + DAY);

export default function StatTimer() {
    const [timespan, setTimespan] = useState(new Date(deadline) - Date.now());
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (new Date(deadline) - Date.now() < 0){
                deadline = new Date(date - (date % DAY) + DAY);;
            }

            setTimespan(new Date(deadline) - Date.now());
          }, 1_000);
      
    
        return () => {
          clearInterval(intervalId);
        };
      }, [deadline]);

    return (
        <div id='stat_timer_section'>
            <p> The Next Winner will be chosen in:</p>
            <div id='stat_timer'>
                <div id='stat_timer_hours'>
                    {Math.floor(timespan / HOUR)}
                </div>

                <div id='stat_timer_minutes'>
                    {Math.floor((timespan / MINUTE) % 60)}
                </div>

                <div id='stat_timer_seconds'>
                    {Math.floor((timespan / SECOND) % 60)}
                </div>
            </div>

        </div>
    )
}