import React from "react"

export const useAdvancedState = <T>(initialValue: T, callbackOnSet?: (value: T) => void): [state: T, setState: (value: T) => void] => {
    const [state, setState] = React.useState(initialValue)

    const setAdvancedState = (value: T) => {
        setState(value)
        if (callbackOnSet) {
            callbackOnSet(value)
        }
    }

    return [state, setAdvancedState]
}