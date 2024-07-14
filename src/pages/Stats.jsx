import React from "react"
import StatCheckForm from '../components/StatCheckForm';
import StatWinner from '../components/StatWinner';
import StatTimer from '../components/StatTimer';
import StatCalendar from "../components/StatCalendar";


export default function Stats() {
    return (
        <>
            <h2 className="highlight_title">Stat Check System</h2>
            <div className='disclaimer-box' >
                <p className='disclaimer'>
                    The Stat Check System is a system meant to encourage healthy competition
                    amongst the members of Spirit of Stony Brook Mellophone section to make
                    good health choices, especially during preseason.
                </p>
                <p className='disclaimer'>
                    Like in Dungeons & Dragons, a “build-your own adventure” book, or any other
                    endearing nerd stat game, each mello has their own stats. The main ones are:
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ul>
                        <li>
                            <div className="stat_description">
                                <div className="peach_highlight">Hydration Level:</div>
                                <p>hydrate or dyedrate</p>
                            </div>
                        </li>
                        <li>
                            <div className="stat_description">
                                <div className="peach_highlight">Food Level:</div>
                                <p>At least two meals a day, but breakfast is a plus.</p>
                            </div>
                        </li>
                        <li>
                            <div className="stat_description">
                                <div className="peach_highlight">Sleep Meter:</div>
                                <p>the daily recommended 8 hours</p>
                            </div>
                        </li>
                        <li>
                            <div className="stat_description">
                                <div className="peach_highlight">Sun Meter:</div>
                                <p>Praise the Sun, or fear it. Get that sunscreen on</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <p className="disclaimer">
                    The stat check system does exactly that, check your stats. You can self
                    report your stats every day and the mello with the highest stats for the
                    day is honored below the follow day. The highest possible score is a 95,
                    but regardless of the score you can be chosen for the smaller honorary
                    awards for excellent stats in one field.</p>
            </div >

            <StatWinner />
            {/* <StatCalendar /> */}

            <p className="disclaimer">Winners are chosen daily at 8 P.M. every night, so…</p>
            <h2>Fill out your form today!</h2>


            <StatCheckForm />
            <StatTimer />
        </>
    )
}