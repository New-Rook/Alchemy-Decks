import React from "react"
import { stringLowerCaseIncludes } from "../utilities/general"
import './TextInputWithSuggestions.css'
import './Menu.css'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    onChangeText: (text: string) => void
    onSelectOption?: (text: string) => void
    validator?: (text: string) => boolean
    suggestions: string[]
    suggestionElementMap?: (suggestion: string) => React.ReactNode
    refocusOnSelectSuggestion?: boolean
    disableSuggestionFiltering?: boolean
    containerProps?: React.HTMLAttributes<HTMLDivElement>
}

export const TextInputWithSuggestions = ({
    label,
    onChangeText,
    onSelectOption,
    validator,
    suggestions,
    suggestionElementMap,
    refocusOnSelectSuggestion,
    disableSuggestionFiltering,
    containerProps,
    ...props
}: Props) => {
    const [currentSuggestions, setCurrentSuggestions] = React.useState<string[]>(suggestions)
    const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = React.useState<number>()
    const [isFocused, setIsFocused] = React.useState(false)
    const focusedRef = React.useRef(false)
    const ref = React.useRef<HTMLInputElement>(null)
    const [height, setHeight] = React.useState(0)

    React.useEffect(() => {
        if (!ref.current) {
            return
        }

        setHeight(ref.current.getBoundingClientRect().height)
    }, [ref.current])

    React.useEffect(() => {
        setCurrentSuggestions(suggestions)
    }, [suggestions])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value

        if (validator && !validator(text)) {
            return
        }

        onChangeText(text)
        if (!disableSuggestionFiltering) {
            setCurrentSuggestions(suggestions.filter(suggestion => stringLowerCaseIncludes(suggestion, text)))
        }
        setHighlightedSuggestionIndex(0)
    }

    const selectOption = React.useCallback((option: string) => {
        if (onSelectOption) {
            onSelectOption(option)
        }
        else {
            onChangeText(option)
        }
        setCurrentSuggestions([])
        setHighlightedSuggestionIndex(undefined)

        if (refocusOnSelectSuggestion) {
            ref.current?.focus()
        }
    }, [onSelectOption, onChangeText, refocusOnSelectSuggestion])

    React.useEffect(() => {
        const closeMenu = () => {
            if (!focusedRef.current) {
                setTimeout(() => {
                    if (!focusedRef.current) {
                        setIsFocused(false)
                    }
                }, 50)
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
            if (highlightedSuggestionIndex === undefined || event.key !== 'Enter' || !focusedRef.current
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

    return <div {...containerProps} className={`flex-column position-relative ${containerProps?.className ?? ''}`}>
        {label}
        <input
            {...props}
            ref={ref}
            type={'search'}
            size={10}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
        />
        <div className="menu-content full-width" style={{ top: height }}>
            {isFocused && currentSuggestions.map((suggestion, index) =>
                <button
                    key={suggestion}
                    onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                    onMouseLeave={() => setHighlightedSuggestionIndex(undefined)}
                    className={`dropdown-option button-no-hover ${!!suggestionElementMap ? 'flex-row flex-gap align-center dropdown-option-with-image base-padding' : ''} ${index === currentSuggestions.length - 1 ? 'border-rounded-bottom' : ''} ${index === highlightedSuggestionIndex ? 'suggestion-highlighted' : ''}`}
                    onClick={() => selectOption(suggestion)}>
                    {suggestionElementMap && suggestionElementMap(suggestion)}
                    {suggestion}
                </button>
            )}
        </div>
    </div >
}