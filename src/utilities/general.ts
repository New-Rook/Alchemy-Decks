export const validateNumberWithRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max
}

export const stringStartsAndEndsWith = (text: string, startEndChar: string) => {
    if (text.length === 0) {
        return false
    }

    return text.charAt(0) === startEndChar && text.charAt(text.length - 1) === startEndChar
}

// Takes an array and removes a given element, returning a new array
export const omitFromArray = <T>(array: T[], element: T) => {
    const index = array.indexOf(element)

    if (index === -1) {
        return array
    }

    const arrayShallowCopy = [...array]
    arrayShallowCopy.splice(index, 1)
    return arrayShallowCopy
}

// Takes a record and removes a given key, returning a new object
export const omitFromRecord = <K extends string | number | symbol, V>(record: Record<K, V>, key: K) => {
    if (!record[key]) {
        return record
    }

    const newObj = { ...record }
    delete newObj[key]
    return newObj
}

export const omitFromPartialRecord = <K extends string | number | symbol, V>(record: Partial<Record<K, V>>, key: K) => {
    if (!record[key]) {
        return record
    }

    const newObj = { ...record }
    delete newObj[key]
    return newObj
}

export const numbersOnlyTextInputValidator = (text: string) => {
    return !/\D/.test(text)
}

export const numbersLimitTextInputValidator = (limit: number) => {
    return (text: string) => {
        const number = parseInt(text)
        return !Number.isInteger(number) || number <= limit
    }
}

export const combineTextInputValidators = (...validators: ((text: string) => boolean)[]) => {
    return (text: string) => validators.every(validator => validator(text))
}