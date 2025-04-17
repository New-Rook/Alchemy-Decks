import React from "react"

export const useBooleanState = (initialState = false): [value: boolean, setToTrue: () => void, setToFalse: () => void] => {
    const [value, setValue] = React.useState(initialState)

    const setToTrue = () => {
        setValue(true)
    }

    const setToFalse = () => {
        setValue(false)
    }

    return [value, setToTrue, setToFalse]
}