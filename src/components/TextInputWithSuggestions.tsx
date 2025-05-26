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
    const [isFocused, setIsFocused] = React.useState(false)
    const ref = React.useRef(false)

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

    React.useEffect(() => {
        const closeMenu = () => {
            if (!ref.current) {
                setTimeout(() => setIsFocused(false), 50)
            }
        }

        window.addEventListener('mouseup', closeMenu)

        return () => window.removeEventListener('mouseup', closeMenu)
    }, [])

    const onFocus = () => {
        ref.current = true
        setIsFocused(true)
    }

    const onBlur = () => {
        ref.current = false
    }

    return <div>
        {label}
        <input
            {...props}
            type={'text'}
            size={10}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
        />
        <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {isFocused && suggestionsToShow.map(suggestion =>
                <button key={suggestion} onClick={() => selectOption(suggestion)}>{suggestion}</button>
            )}
        </div>
    </div >
}