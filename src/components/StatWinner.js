import React from 'react'
import '../styles/stats-winner.css'


export default function StatWinner() {
    return (
        <>
            <div className='spacer winner_box_top'></div>

            <div id='winner_box'>
                <p>The Mello with the highest stats today is</p>
                <p id='stat_winner' className='winner_name'>NAME</p>

                <div id='stat_awards'>
                    <div id='hydration_winner'>
                        <p>Most hydrated: </p>
                        <p className='winner_name'>
                            NAME
                        </p>
                    </div>
                    <div id='sunscreen_winner'>
                        <p>Most Sunscreened: </p>
                        <p className='winner_name'>
                            NAME
                        </p>
                    </div>
                    <div id='breakfast_winner'>
                        <p>Most Breakfasted: </p>
                        <p className='winner_name'>
                            NAME
                        </p>
                    </div>
                </div>
            </div>

            <div className='spacer winner_box_bottom'></div>
        </>
    )
}