import React, { useContext, useEffect, useState } from 'react'
import '../styles/stats-winner.css'
import { LoadingContext, server } from '../App';

const empty_winners = {
    stat_winner: { username: "No Winner", score: -1 },
    hydration_winner: { username: "No Winner", score: -1 },
    sleep_winner: { username: "No Winner", score: -1 },
    sunscreen_winner: { username: "No Winner", score: -1 }
}

export default function StatWinner() {
    const {loading, setLoading} = useContext(LoadingContext);
    const [winners, setWinners] = useState({ ...empty_winners });

    useEffect(() => {
        if (!loading) setLoading(true)
        let date = new Date();
        server.get(`/stats/winners?day=${date}`)
            .then(res => {
                setWinners(res.data)
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setWinners({ ...empty_winners })
                setLoading(false);
            })
    }, []);

    return (
        <>
            <div className='spacer winner_box_top'></div>

            <div id='winner_box'>
                <p>The Mello with the HIGHEST stats today is</p>
                <p id='stat_winner' className='winner_name'>{winners.stat_winner.username}</p>

                <div id='stat_awards'>
                    <div id='hydration_winner'>
                        <p>Most hydrated: </p>
                        <p className='winner_name'>
                            {winners.hydration_winner.username}
                        </p>
                    </div>
                    <div id='sunscreen_winner'>
                        <p>Rested the Best: </p>
                        <p className='winner_name'>
                            {winners.sleep_winner.username}
                        </p>
                    </div>
                    <div id='breakfast_winner'>
                        <p>Praised the Sun: </p>
                        <p className='winner_name'>
                            {winners.sunscreen_winner.username}
                        </p>
                    </div>
                </div>
            </div>

            <div className='spacer winner_box_bottom'></div>
        </>
    )
}