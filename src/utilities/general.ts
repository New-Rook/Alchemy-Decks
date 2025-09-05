import { CurrencyType } from "../types"

export const validateNumberWithRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max
}

export const stringStartsAndEndsWith = (text: string, startEndChar: string) => {
    if (text.length === 0) {
        return false
    }

    return text.charAt(0) === startEndChar && text.charAt(text.length - 1) === startEndChar
}

export const numberToDecimalPoints = (num: number, decimalPoints: number) => {
    return parseFloat(num.toFixed(decimalPoints))
}

export const stringLowerCaseIncludes = (text: string, testString: string) => {
    return text.toLocaleLowerCase().includes(testString.toLocaleLowerCase())
}

export const invertBoolean = (value: boolean, invert: boolean) => {
    return invert ? !value : value
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

// Mutable remove array element
export const removeFromArray = <T>(array: T[], ...elements: T[]) => {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const index = array.indexOf(element)

        if (index === -1) {
            continue
        }

        array.splice(index, 1)
    }

    return array
}

export const toUniqueArray = <T>(array: T[]) => {
    return Array.from(new Set(array))
}

export const splitArray = <T>(array: T[], predicate: (element: T) => boolean): [T[], T[]] => {
    const filteredArray: T[] = []
    const otherArray: T[] = []

    array.forEach(element => {
        if (predicate(element)) {
            filteredArray.push(element)
        }
        else {
            otherArray.push(element)
        }
    })

    return [filteredArray, otherArray]
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

export const typedKeys = <K extends string | number | symbol, V>(obj: Record<K, V>) => {
    return Object.keys(obj) as K[]
}

// Text input specific

export const numbersOnlyTextInputValidator = (text: string) => {
    return !/\D/.test(text)
}

export const numbersLimitTextInputValidator = (limit: number) => {
    return (text: string) => {
        const number = parseInt(text)
        if (Number.isInteger(number)) {
            return number <= limit
        }
        else {
            return text.length === 0
        }
    }
}

export const lengthLimitTextInputValidator = (limit: number) => {
    return (text: string) => {
        return text.length <= limit
    }
}

export const combineTextInputValidators = (...validators: ((text: string) => boolean)[]) => {
    return (text: string) => validators.every(validator => validator(text))
}

export const addCurrencyToText = (text: string | number, currency: CurrencyType) => {
    if (currency === 'eur') {
        return `${text}€`
    }

    if (currency === 'usd') {
        return `$${text}`
    }

    return text
}

export const removeAccentsFromString = (text: string) => {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}