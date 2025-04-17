import { CardData, CardSorter, SortType } from "../types";

export const getCardBaseData = (card: CardData) => {
    if (card.card_faces) {
        return card.card_faces[0]
    }

    return card
}

export const getCardImages = (card: CardData) => {
    return getCardBaseData(card).image_uris
}

export const sortCardsByName = (cardA: CardData, cardB: CardData) => cardA.name.localeCompare(cardB.name)
export const sortCardsByManaValue = (cardA: CardData, cardB: CardData) => cardA.cmc - cardB.cmc
export const sortCardsByType = (cardA: CardData, cardB: CardData) => cardA.cmc - cardB.cmc
export const sortCardsByPriceEUR = (cardA: CardData, cardB: CardData) => parseFloat(cardA.prices.eur) - parseFloat(cardB.prices.eur)
export const sortCardsByPriceUSD = (cardA: CardData, cardB: CardData) => parseFloat(cardA.prices.usd) - parseFloat(cardB.prices.usd)

export const CARD_SORTERS: Record<SortType, CardSorter> = {
    name: sortCardsByName,
    "mana-value": sortCardsByManaValue,
    type: sortCardsByType,
    "price-eur": sortCardsByPriceEUR,
    "price-usd": sortCardsByPriceUSD
}