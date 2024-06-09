import React from 'react';

export default function StatCheckForm() {

    return (
        <div id='submit_form'>
            <form>
                {/* Hydration */}
                <div id='hydration'>
                    <div id='hydration_question'>
                        <p> What is your hydration chart today?</p>
                        <div id='hydration_chart'>
                            <div className='hydration_entry'>
                                <div className='hydration_color'
                                    style={{ backgroundColor: '#fff8b9' }}
                                ></div>
                                <p>Sandy Shore </p>
                                <input type='radio'></input>
                            </div>
                            <div className='hydration_entry'>
                                <div className='hydration_color'
                                    style={{ backgroundColor: '#fff177' }}
                                ></div>
                                <p>Gatorade Lemonade</p>
                                <input type='radio'></input>
                            </div>
                            <div className='hydration_entry'>
                                <div className='hydration_color'
                                    style={{ backgroundColor: '#f5e762' }}
                                ></div>
                                <p>Light Beer</p>
                                <input type='radio'></input>
                            </div>
                            <div className='hydration_entry'>
                                <div className='hydration_color'
                                    style={{ backgroundColor: '#f6cd51' }}
                                ></div>
                                <p>Amber</p>
                                <input type='radio'></input>
                            </div>
                            <div className='hydration_entry'>
                                <div className='hydration_color'
                                    style={{ backgroundColor: '#cb9800' }}
                                ></div>
                                <p>Tennesee Burn Orange</p>
                                <input type='radio'></input>
                            </div>
                        </div>
                    </div>
                    <div id='hydration_score' className='CHS_score_box'>
                        <b>NUMBER</b>
                    </div>
                </div>

                {/* Meals Taken */}
                <div id='meals'>
                    <div id='meals_question'>
                        <p> How many meals did you have today? </p>
                        <div id='meals_row'>
                            <div className='meal_entry'>
                                <label htmlFor='meal_1'>First Meal: </label>
                                <input type='checkbox' id='meal_1'></input>
                            </div>
                            <div className='meal_entry'>
                                <label htmlFor='meal_2'>Second Meal: </label>
                                <input type='checkbox' id='meal_2'></input>
                            </div>
                            <div className='meal_entry'>
                                <label htmlFor='breakfast'>Any breakfast?</label>
                                <input type='checkbox' id='breakfast'></input>
                            </div>
                        </div>
                    </div>
                    <div id='meals_score' className='CHS_score_box'>
                        <b>NUMBER</b>
                    </div>
                </div>

                {/* Hours of sleep */}
                <div id='sleep'>
                    <div id='sleep_question'>
                        <label htmlFor='sleep_entry'>Hours of sleep: </label>
                        <input type="range" min="0" max="10" id="sleep_entry"></input>
                    </div>
                    <div id='sleep_score' className='CHS_score_box'>
                        <b>NUMBER</b>
                    </div>
                </div>

                {/* Sunscreen */}
                <div id='sunscreen'>
                    <div id='sunscreen_question'>
                        <label htmlFor='sunscreen_entry'>How many times did you put sunscreen: </label>
                        <input type="range" min="0" max="8" id="sunscreen_entry"></input>
                    </div>
                    <div id='sunscreen_score' className='CHS_score_box'>
                        <b>NUMBER</b>
                    </div>
                </div>

                {/* TOTAL Scoring */}
                <div id='scoring'>
                    <input type='submit' id='stats_submit_button'>
                    </input>
                    <div id='scoring_points'>
                        <h4 id='score_title'> TOTAL POINTS: </h4>
                        <div id='final_score' className='CHS_score_box'>
                            <b>NUMBER</b>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    )
}