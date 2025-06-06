import React from "react"
import { stringLowerCaseIncludes } from "../utilities/general"
import './TextInputWithSuggestions.css'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    validator?: (text: string) => boolean
    suggestions: string[]
}

export const TextInputWithSuggestions = ({ label, onChangeText, validator, suggestions, value, ...props }: Props) => {
    const [currentSuggestions, setCurrentSuggestions] = React.useState<string[]>(suggestions)
    const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = React.useState<number>()
    const [isFocused, setIsFocused] = React.useState(false)
    const focusedRef = React.useRef(false)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
        setCurrentSuggestions(suggestions.filter(suggestion => stringLowerCaseIncludes(suggestion, text)))
        setHighlightedSuggestionIndex(0)
    }

    const selectOption = React.useCallback((option: string) => {
        onChangeText(option)
        setCurrentSuggestions([])
        setHighlightedSuggestionIndex(undefined)
    }, [onChangeText])

    React.useEffect(() => {
        const closeMenu = () => {
            if (!focusedRef.current) {
                setTimeout(() => setIsFocused(false), 50)
            }
        }

        window.addEventListener('mouseup', closeMenu)

        return () => window.removeEventListener('mouseup', closeMenu)
    }, [])

    React.useEffect(() => {
        const moveToPreviousSuggestion = (event: KeyboardEvent) => {
            if (event.key !== 'ArrowUp' || !focusedRef.current
                || !currentSuggestions || currentSuggestions.length === 0) {
                return
            }
            setHighlightedSuggestionIndex(prev => {
                if (prev === undefined || prev === 0) {
                    return currentSuggestions.length - 1
                }
                else {
                    return prev - 1
                }
            })
        }

        const moveToNextSuggestion = (event: KeyboardEvent) => {
            if (event.key !== 'ArrowDown' || !focusedRef.current
                || !currentSuggestions || currentSuggestions.length === 0) {
                return
            }
            setHighlightedSuggestionIndex(prev => {
                if (prev === undefined || prev === currentSuggestions.length - 1) {
                    return 0
                }
                else {
                    return prev + 1
                }
            })
        }

        window.addEventListener('keydown', moveToPreviousSuggestion)
        window.addEventListener('keydown', moveToNextSuggestion)

        return () => {
            window.removeEventListener('keydown', moveToPreviousSuggestion)
            window.removeEventListener('keydown', moveToNextSuggestion)
        }
    }, [currentSuggestions])

    React.useEffect(() => {
        const selectSuggestion = (event: KeyboardEvent) => {
            if (!highlightedSuggestionIndex || event.key !== 'Enter' || !focusedRef.current
                || !currentSuggestions || currentSuggestions.length === 0) {
                return
            }
            selectOption(currentSuggestions[highlightedSuggestionIndex])
        }

        window.addEventListener('keyup', selectSuggestion)

        return () => window.removeEventListener('keyup', selectSuggestion)
    }, [currentSuggestions, highlightedSuggestionIndex])

    const onFocus = () => {
        focusedRef.current = true
        setIsFocused(true)
    }

    const onBlur = () => {
        focusedRef.current = false
    }

    return <div>
        {label}
        <input
            {...props}
            type={'search'}
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
            {isFocused && currentSuggestions.map((suggestion, index) =>
                <button
                    key={suggestion}
                    onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                    onMouseLeave={() => setHighlightedSuggestionIndex(undefined)}
                    className={`button-no-hover ${index === highlightedSuggestionIndex ? 'suggestion-highlighted' : ''}`}
                    onClick={() => selectOption(suggestion)}>
                    {suggestion}
                </button>
            )}
        </div>
    </div >
}