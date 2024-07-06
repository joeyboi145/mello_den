import React, { useContext, useEffect, useState } from 'react';
import HydrationEntry from './HydrationEntry';
import MealEntry from './MealEntry';
import { CurrentUserContext, LoadingContext, NotificationContext } from '../App';
import { server } from '../App';
import '../styles/stats-form.css'
import { createNotification, getMealScore, getTotalScore } from '../utils/functions';
import { NavLink } from 'react-router-dom';

const empty_form = {
    hydration_level: 0,
    meals: {
        breakfast: false,
        meal_1: false,
        meal_2: false
    },
    sleep: 0,
    sunscreen: 0,
    completed: false
}

export default function StatCheckForm() {
    const { currentUser } = useContext(CurrentUserContext);
    const { loading, setLoading } = useContext(LoadingContext);
    const { setNotification } = useContext(NotificationContext);
    // const [complete, setComplete] = useState(false)
    const [form, setForm] = useState({ ...empty_form });

    // NOTE: currentUser will be NOT be stale
    useEffect(() => {
        if (currentUser.verified) {
            if (!loading) setLoading(true);

            server.get(`/stats/form/${currentUser.username}`)
                .then(res => {
                    let statForm = res.data
                    var notification = createNotification("Retrieved previous form")
                    setForm(statForm);
                    if (!statForm.completed) setNotification(notification);
                    setLoading(false);
                })
                .catch(err => {
                    console.log("Form not found", err);
                    setLoading(false);
                })
        }
    }, [currentUser.verified])

    useEffect(() => {
        submitStatForm();
    }, [form.hydration_level, form.sleep, form.sunscreen,
    form.meals, form.meals.meal_1, form.meals.meal_2,
    form.meals.breakfast, form.completed]);

    function handleFormChange(event) {
        const { name, value } = event.target;
        setForm(prevData => {
            return {
                ...prevData,
                [name]: parseInt(value)
            }
        });
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
        });
    }

    function submitStatForm() {
        if (getTotalScore(form) === 0 || !currentUser.verified) return
        server.post(`/stats/form/${currentUser.username}`, {
            ...form
        })
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    function handleClick(event) {
        event.preventDefault();
        setForm(prevData => {
            return {
                ...prevData,
                completed: true
            }
        });
    }

    function submitFormReset() {
        if (!form.completed) return

        if (!loading) setLoading(true)
        server.delete(`/stats/form/${currentUser.username}`)
            .then(() => {
                var notification = createNotification("Stat Form Reset")
                setNotification(notification);
                setForm({ ...empty_form })
                setLoading(false)
            }).catch(err => {
                console.log(err)
                setLoading(false)
            });
    }


    if (!currentUser.login) {
        return (<div className='stats-credentials-box'>
            <p>Log in to complete your form!</p>
            <NavLink to='../login' className="submit_button" >
                Log in
            </NavLink>
        </div>);
    } else if (!currentUser.verified) {
        return (<div className='stats-credentials-box'>
            <p>Verify your account to complete your form!</p>
            <NavLink to='../verification' className="submit_button" >
                Verify
            </NavLink>
        </div>)
    } else if (form.completed) {
        return (
            <>
                <p>Your score today:</p>
                <div className='total-score-box animate-main-color-change'>{getTotalScore(form)}</div>
                <button className='submit_button' onClick={submitFormReset}>Reset Form</button>
            </>
        )
    } else if (currentUser.login && currentUser.verified && !loading) {
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
                            <b>{getMealScore(form)}</b>
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
                        <input type='submit'
                            id='stats_submit_button'
                            onClick={handleClick}>
                        </input>
                        <div id='scoring_points'>
                            <h4 id='score_title'> TOTAL POINTS: </h4>
                            <div id='final_score' className='stat_score_box'>
                                <b>{getTotalScore(form)}</b>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    } else return
}