import { CardData, CardSorter, SortType } from "../types";
import { getCardColorPriority, getLastCardType } from "./card";

export const sortCardsByName = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const comparison = cardA.name.localeCompare(cardB.name)
    return invert ? -comparison : comparison
}

export const sortCardsByManaValue = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const cardAManaValue = getLastCardType(cardA) === 'Land' ? Infinity : cardA.cmc
    const cardBManaValue = getLastCardType(cardB) === 'Land' ? Infinity : cardB.cmc
    if (cardAManaValue === cardBManaValue) {
        return sortCardsByName(cardA, cardB, false)
    }

    const comparison = cardAManaValue - cardBManaValue

    return invert ? -comparison : comparison
}

export const sortCardsByColor = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const comparison = getCardColorPriority(cardA) - getCardColorPriority(cardB)

    if (comparison === 0) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    return invert ? -comparison : comparison
}

export const sortCardsByType = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const lastCardAType = getLastCardType(cardA)
    const lastCardBType = getLastCardType(cardB)

    const comparison = lastCardAType.localeCompare(lastCardBType)

    if (comparison === 0) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    return invert ? -comparison : comparison
}

// export const sortCardsByCreatureType = (cardA: CardData, cardB: CardData, invert: boolean) => {
//     const cardACreatureTypes = cardA.type_line.split(' ')
//     const lastCardAType = cardACreatureTypes[cardACreatureTypes.length - 1]

//     const cardBCreatureTypes = cardB.type_line.split(' ')
//     const lastCardBType = cardBCreatureTypes[cardBCreatureTypes.length - 1]

//     const comparison = lastCardAType.localeCompare(lastCardBType)

//     if (comparison === 0) {
//         return sortCardsByManaValue(cardA, cardB, false)
//     }

//     return invert ? -comparison : comparison
// }

export const sortCardsByPriceEUR = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const cardAPrice = parseFloat(cardA.prices.eur) || parseFloat(cardA.prices.eur_foil) || 0
    const cardBPrice = parseFloat(cardB.prices.eur) || parseFloat(cardB.prices.eur_foil) || 0

    if (cardAPrice === cardBPrice) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    const comparison = cardAPrice - cardBPrice

    return invert ? -comparison : comparison
}

export const sortCardsByPriceUSD = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const cardAPrice = parseFloat(cardA.prices.usd) || parseFloat(cardA.prices.usd_foil) || 0
    const cardBPrice = parseFloat(cardB.prices.usd) || parseFloat(cardB.prices.usd_foil) || 0

    if (cardAPrice === cardBPrice) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    const comparison = cardAPrice - cardBPrice

    return invert ? -comparison : comparison
}

export const CARD_SORTERS: Record<SortType, CardSorter> = {
    name: sortCardsByName,
    "mana-value": sortCardsByManaValue,
    color: sortCardsByColor,
    type: sortCardsByType,
    "price-eur": sortCardsByPriceEUR,
    "price-usd": sortCardsByPriceUSD
}