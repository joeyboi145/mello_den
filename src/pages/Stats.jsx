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
                            <div style={{ display: 'flex', textWrap: 'nowrap' }}>
                                <div className="peach_highlight">Hydration level</div>
                                : hydrate or dyedrate
                            </div>
                        </li>
                        <li>
                            <div style={{ display: 'flex', textWrap: 'nowrap' }}>
                                <div className="peach_highlight">Food level</div>
                                : At least two meals a day, but breakfast is a plus.
                            </div>
                        </li>
                        <li>
                            <div style={{ display: 'flex', textWrap: 'nowrap' }}>
                                <div className="peach_highlight">Sleep meter</div>
                                : the daily recommended 8 hours
                            </div>
                        </li>
                        <li>
                            <div style={{ display: 'flex', textWrap: 'nowrap' }}>
                                <div className="peach_highlight">Sun meter</div>
                                : Praise the Sun, or fear it. Get that sunscreen on
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

            <h2>Filled out your form today?</h2>
            <StatCheckForm />
            <StatTimer />
        </>
    )
}