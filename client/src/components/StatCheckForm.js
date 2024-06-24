import React, { useState } from 'react';
import HydrationEntry from './HydrationEntry';
import MealEntry from './MealEntry';

const server = axios.create({
    baseURL: 'http://localhost:3333',
    timeout: 5000
})


export default function StatCheckForm() {
    const [form, setForm] = useState({
        hydration_level: 0,
        meals: {
            breakfast: false,
            meal_1: false,
            meal_2: false
        },
        sleep: 0,
        sunscreen: 0,
    });

    function getMealScore() {
        let score = 0;
        if (form.meals.meal_1) score += 20;
        if (form.meals.meal_2) score += 20;
        if (form.meals.breakfast) score += 1;
        return score
    }

    function getTotalScore() {
        let score = (form.hydration_level * 2) + getMealScore()
            + (form.sleep * 3)
            + (form.sunscreen * 2)
        return score
    }

    function handleFormChange(event) {
        const { name, value } = event.target;
        setForm(prevData => {
            return {
                ...prevData,
                [name]: parseInt(value)
            }
        })
    }

    function handleMealChange(event) {
        const { name, value } = event.target;
        setForm(prevData => {
            const meals = prevData.meals
            return {
                ...prevData,
                meals: {
                    ...meals,
                    [name]: value === 'false'
                }
            }
        })
    }

    function validate(){
        
    }

    function submitStatForm(){
        
    }

    return (
        // FIXME: move id SUBMIT FORM down a level
        <div id='submit_form'>
            <form>
                {/* Hydration */}
                <div id='hydration'>
                    <div id='hydration_question'>
                        <p> What is your hydration chart today?</p>
                        <fieldset id='hydration_chart'>
                            <HydrationEntry value={4} color='#fff8b9' form={{ form, handleFormChange }} />
                            <HydrationEntry value={3} color='#fff177' form={{ form, handleFormChange }} />
                            <HydrationEntry value={2} color='#f5e762' form={{ form, handleFormChange }} />
                            <HydrationEntry value={1} color='#f6cd51' form={{ form, handleFormChange }} />
                            <HydrationEntry value={0} color='#cb9800' form={{ form, handleFormChange }} />
                        </fieldset>
                    </div>
                    <div id='hydration_score' className='stat_score_box'>
                        <b>{form.hydration_level * 2}</b>
                    </div>
                </div>

                {/* Meals Taken */}
                <div id='meals'>
                    <div id='meals_question'>
                        <p> How many meals did you have today? </p>
                        <div id='meals_row'>
                            <MealEntry mealName="meal_1" form={{ form, handleMealChange }} />
                            <MealEntry mealName="meal_2" form={{ form, handleMealChange }} />
                            <MealEntry mealName="breakfast" form={{ form, handleMealChange }} />
                        </div>
                    </div>
                    <div id='meals_score' className='stat_score_box'>
                        <b>{getMealScore()}</b>
                    </div>
                </div>

                {/* Hours of sleep */}
                <div id='sleep'>
                    <div id='sleep_question'>
                        <label htmlFor='sleep_entry'>Hours of sleep: </label>
                        <input type="range"
                            min="0"
                            max="10"
                            value={form.sleep}
                            id="sleep_entry"
                            name='sleep'
                            onChange={handleFormChange} />
                    </div>
                    <div id='sleep_score' className='stat_score_box'>
                        <b>{form.sleep * 3}</b>
                    </div>
                </div>

                {/* Sunscreen */}
                <div id='sunscreen'>
                    <div id='sunscreen_question'>
                        <label htmlFor='sunscreen_entry'>How many times did you put sunscreen: </label>
                        <input type="range"
                            min="0"
                            max="8"
                            value={form.sunscreen}
                            id="sunscreen_entry"
                            name='sunscreen'
                            onChange={handleFormChange} />
                    </div>
                    <div id='sunscreen_score' className='stat_score_box'>
                        <b>{form.sunscreen * 2}</b>
                    </div>
                </div>

                {/* TOTAL Scoring */}
                <div id='scoring'>
                    <input type='submit' id='stats_submit_button'>
                    </input>
                    <div id='scoring_points'>
                        <h4 id='score_title'> TOTAL POINTS: </h4>
                        <div id='final_score' className='stat_score_box'>
                            <b>{getTotalScore()}</b>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    )
}