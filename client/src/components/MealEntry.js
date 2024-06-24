import React from "react";

export default function MealEntry(props) {
    const { form, handleMealChange } = props.form

    let name = ''
    if (props.mealName === 'meal_1') name = "First Meal:"
    if (props.mealName === 'meal_2') name = "Second Meal:"
    if (props.mealName === 'breakfast') name = "Any Breakfast?"

    return (
        <div className='meal_entry'>
            <label htmlFor={props.mealName}>{name}</label>
            <input type='checkbox'
                id={props.mealName}
                name={props.mealName}
                value={form.meals[props.mealName]}
                onChange={handleMealChange} />
        </div>
    )
}