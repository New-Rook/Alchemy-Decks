import { CardData, CardTypeFilter, SearchFilterOperation, StatFilter } from "../types"
import { invertBoolean, stringLowerCaseIncludes } from "./general"

export const nextSearchFilterOperation = (current: SearchFilterOperation): SearchFilterOperation => {
    if (current === 'or') {
        return 'and'
    }
    else if (current === 'and') {
        return 'or'
    }
    return 'or'
}

export const checkCardTypeFilter = (card: CardData, filter: CardTypeFilter) => {
    return invertBoolean(stringLowerCaseIncludes(card.type_line, filter.cardType), filter.invert)
}

export const checkStatFilter = (card: CardData, filter: StatFilter) => {
    if (filter.stat === 'mana-value') {
        return checkStatFilterOperations(card.cmc, filter)
    }
    else if (filter.stat === 'power') {
        const power = parseInt(card.power.replace(/[*+]/g, ''))
        return checkStatFilterOperations(Number.isInteger(power) ? power : 0, filter)
    }
    else if (filter.stat === 'toughness') {
        const toughness = parseInt(card.toughness.replace(/[*+]/g, ''))
        return checkStatFilterOperations(Number.isInteger(toughness) ? toughness : 0, filter)
    }
}

const checkStatFilterOperations = (cardStatValue: number, filter: StatFilter) => {
    switch (filter.operation) {
        case "equal":
            return cardStatValue === filter.value
        case "not-equal":
            return cardStatValue !== filter.value
        case "greater-than":
            return cardStatValue > filter.value
        case "greater-than-or-equal":
            return cardStatValue >= filter.value
        case "less-than":
            return cardStatValue < filter.value
        case "less-than-or-equal":
            return cardStatValue <= filter.value
        default:
            return true
    }
}
