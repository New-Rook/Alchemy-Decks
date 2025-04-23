import { CardData, CardSorter, SortType } from "../types";

export const getCardBaseData = (card: CardData) => {
    if (card.card_faces) {
        return card.card_faces[0]
    }

    return card
}

export const getCardAllOracleText = (card: CardData) => {
    if (card.card_faces) {
        return card.card_faces.reduce((combinedText, face) => `${combinedText}\n${face.oracle_text}`, '')
    }

    return card.oracle_text
}

export const getCardAllCardName = (card: CardData) => {
    if (card.card_faces) {
        return card.card_faces.reduce((combinedText, face) => `${combinedText}\n${face.name}`, '')
    }

    return card.name
}

export const getCardImages = (card: CardData) => {
    return getCardBaseData(card).image_uris
}

export const sortCardsByName = (cardA: CardData, cardB: CardData, invert: boolean) => {
    const comparison = cardA.name.localeCompare(cardB.name)
    return invert ? -comparison : comparison
}

export const sortCardsByManaValue = (cardA: CardData, cardB: CardData, invert: boolean) => {
    if (cardA.cmc === cardB.cmc) {
        return sortCardsByName(cardA, cardB, false)
    }

    const comparison = cardA.cmc - cardB.cmc

    return invert ? -comparison : comparison
}

export const sortCardsByType = (cardA: CardData, cardB: CardData, invert: boolean) => {
    // const cardTypes = cardA.type_line.replace(/basic|legendary/ig, '').split(' ')
    const cardATypesMatch = cardA.type_line.match(/[\w ]+(?=—{0,1})/)
    const cardATypeLine = cardATypesMatch ? cardATypesMatch[0] : ''
    const cardATypes = cardATypeLine.split(' ')
    const lastCardAType = cardATypes ? cardATypes[cardATypes.length - 1] : ''

    const cardBTypesMatch = cardB.type_line.match(/[\w ]+(?=—{0,1})/i)
    const cardBTypeLine = cardBTypesMatch ? cardBTypesMatch[0] : ''
    const cardBTypes = cardBTypeLine.split(' ')
    const lastCardBType = cardBTypes ? cardBTypes[cardBTypes.length - 1] : ''

    const comparison = lastCardAType.localeCompare(lastCardBType)

    if (comparison === 0) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    return invert ? -comparison : comparison
}

export const sortCardsByCreatureType = (cardA: CardData, cardB: CardData, invert: boolean) => {
    // const cardTypes = cardA.type_line.replace(/basic|legendary/ig, '').split(' ')
    const cardACreatureTypes = cardA.type_line.split(' ')
    const lastCardAType = cardACreatureTypes[cardACreatureTypes.length - 1]

    const cardBCreatureTypes = cardB.type_line.split(' ')
    const lastCardBType = cardBCreatureTypes[cardBCreatureTypes.length - 1]

    const comparison = lastCardAType.localeCompare(lastCardBType)

    if (comparison === 0) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    return invert ? -comparison : comparison
}

export const sortCardsByPriceEUR = (cardA: CardData, cardB: CardData, invert: boolean) => {
    // const cardAPrice = parseFloat(cardA.prices.eur ?? cardA.prices.eur_foil ?? (invert ? Infinity : 0))
    // const cardBPrice = parseFloat(cardB.prices.eur ?? cardB.prices.eur_foil ?? (invert ? Infinity : 0))

    const cardAPrice = parseFloat(cardA.prices.eur) || parseFloat(cardA.prices.eur_foil) || 0
    const cardBPrice = parseFloat(cardB.prices.eur) || parseFloat(cardB.prices.eur_foil) || 0

    if (cardAPrice === cardBPrice) {
        return sortCardsByManaValue(cardA, cardB, false)
    }

    const comparison = cardAPrice - cardBPrice

    return invert ? -comparison : comparison
}

export const sortCardsByPriceUSD = (cardA: CardData, cardB: CardData, invert: boolean) => {
    // const comparison = parseFloat(cardA.prices.usd) - parseFloat(cardB.prices.usd)
    // return invert ? -comparison : comparison

    // const cardAPrice = parseFloat(cardA.prices.usd ?? cardA.prices.usd_foil ?? (invert ? Infinity : 0))
    // const cardBPrice = parseFloat(cardA.prices.usd ?? cardA.prices.usd_foil ?? (invert ? Infinity : 0))

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
    type: sortCardsByType,
    "price-eur": sortCardsByPriceEUR,
    "price-usd": sortCardsByPriceUSD
}