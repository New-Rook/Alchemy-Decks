export const validateNumberWithRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max
}