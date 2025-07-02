import { searchRegex } from "../data/search"
import { CardData, CardTypeFilter, SearchFilterOperation, SearchTermFilter, StatFilter } from "../types"
import { getCardAllOracleText } from "./card"
import { invertBoolean, removeAccentsFromString, stringLowerCaseIncludes, stringStartsAndEndsWith } from "./general"

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
        if (!card.power) {
            return false
        }
        const power = parseInt(card.power.replace(/[*+]/g, ''))
        return checkStatFilterOperations(Number.isInteger(power) ? power : 0, filter)
    }
    else if (filter.stat === 'toughness') {
        if (!card.toughness) {
            return false
        }
        const toughness = parseInt(card.toughness.replace(/[*+]/g, ''))
        return checkStatFilterOperations(Number.isInteger(toughness) ? toughness : 0, filter)
    }
}

const checkStatFilterOperations = (cardStatValue: number, filter: StatFilter) => {
    const filterValue = parseInt(filter.value)

    if (!Number.isInteger(filterValue)) {
        return true
    }

    switch (filter.operation) {
        case "equal":
            return cardStatValue === filterValue
        case "not-equal":
            return cardStatValue !== filterValue
        case "greater-than":
            return cardStatValue > filterValue
        case "greater-than-or-equal":
            return cardStatValue >= filterValue
        case "less-than":
            return cardStatValue < filterValue
        case "less-than-or-equal":
            return cardStatValue <= filterValue
        default:
            return true
    }
}

export const searchTermFilterToRegexes = (filter: SearchTermFilter) => {
    if (!filter.text.trim()) {
        return []
    }
    const searchTerms = filter.text.trim().match(searchRegex)
    if (!searchTerms) {
        return []
    }
    return searchTerms.map(text => {
        const term = stringStartsAndEndsWith(text, '"') ? text.slice(1, -1).toLocaleLowerCase() : text.toLocaleLowerCase()
        return new RegExp(removeAccentsFromString(term))
    })
}

export const checkOracleTextSearchTermFilter = (card: CardData, filter: SearchTermFilter, regexes: RegExp[]) => {
    return invertBoolean(regexes.every(regex => regex.test(card.utility.searchOracleText)), filter.invert)
}

export const STICKERS_ATTRACTIONS_REGEX = /Sticker|Attraction/
