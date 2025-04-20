export const validateNumberWithRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max
}

export const stringStartsAndEndsWith = (text: string, startEndChar: string) => {
    if (text.length === 0) {
        return false
    }

    return text.charAt(0) === startEndChar && text.charAt(text.length - 1) === startEndChar
}