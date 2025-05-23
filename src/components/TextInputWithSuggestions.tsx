import React from "react"
import { stringLowerCaseIncludes } from "../utilities/general"

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
    suggestions: string[]
}

export const TextInputWithSuggestions = ({ label, onChangeText, validator, suggestions, value, ...props }: Props) => {
    const [currentSuggestions, setCurrentSuggestions] = React.useState<string[]>()

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
        setCurrentSuggestions(suggestions.filter(suggestion => stringLowerCaseIncludes(suggestion, text)))
    }

    const selectOption = (option: string) => {
        onChangeText(option)
        setCurrentSuggestions([])
    }

    const suggestionsToShow = currentSuggestions ? currentSuggestions : suggestions

    return <div className="flex-column">
        {label}
        <input
            {...props}
            type={'text'}
            size={10}
            value={value}
            onChange={onChange}
        />
        <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {suggestionsToShow.map(suggestion =>
                <button key={suggestion} onClick={() => selectOption(suggestion)}>{suggestion}</button>
            )}
        </div>
    </div >
}