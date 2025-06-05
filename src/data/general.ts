import { Format } from "../types"
import { FORMATS } from "./search"

export const NUMBER_NAME_MAP: Record<string, number> = {
    'seven': 7,
    'nine': 9,
}

export const basicLandRegex = /Basic/

export const FORMAT_DATA_MAP = FORMATS.reduce<Record<Format, { label: string }>>(
    (formatData, format) => {
        formatData[format.value] = { label: format.label }
        return formatData
    }, {} as Record<Format, { label: string }>)
