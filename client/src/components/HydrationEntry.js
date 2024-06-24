import React from "react";

export default function HydrationEntry(props) {
    const { form, handleFormChange } = props.form
    return (
        <div className='hydration_entry'>
            <div className='hydration_color'
                style={{ backgroundColor: props.color }}
            ></div>
            <p>Sandy Shore </p>
            <input type='radio'
                value={props.value}
                name="hydration_level"
                checked={form.hydration_level === props.value}
                onChange={handleFormChange} />
        </div>
    )
}
