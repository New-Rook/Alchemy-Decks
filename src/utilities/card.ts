import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_COMBINATIONS_MAP, COLOR_ORDER_PRIORITY, COLORLESS_ORDER_PRIORITY, LAND_ORDER_PRIORITY } from "../data/search";
import { CardData, Color, UserData } from "../types";
import { addCurrencyToText, toUniqueArray } from "./general";

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

export const getCardFrontImage = (card: CardData) => {
    if (card.image_uris) {
        return card.image_uris
    }

    return getCardBaseData(card).image_uris
}

export const getCardColors = (card: CardData) => {
    if (isCardDoubleFaced(card) && card.card_faces) {
        // Could use ! instead of checking card.card_faces again
        return toUniqueArray(card.card_faces.reduce<Color[]>((colors, cardFace) => [...colors, ...cardFace.colors], []))
    }

    return card.colors
}

export const getCardColorsForSearch = (card: CardData) => {
    if (card.card_faces) {
        if (card.colors) {
            return card.color_identity
        }
        return toUniqueArray(card.card_faces.reduce<Color[]>((colors, cardFace) => [...colors, ...cardFace.colors], []))
    }

    return card.colors
}

export const getCardImages = (card: CardData) => {
    if (card.image_uris) {
        return [card.image_uris]
    }

    if (card.card_faces) {
        return card.card_faces.map(cardFace => cardFace.image_uris)
    }

    return []
}

export const getLastCardType = (cardData: CardData) => {
    // const cardTypesMatch = cardData.type_line.match(/[\w ]+(?=—{0,1})/)
    // const cardTypeLine = cardTypesMatch ? cardTypesMatch[0] : ''
    // const cardTypes = cardTypeLine.trim().split(' ')
    const cardTypes = getCardTypes(cardData)
    const lastCardType = cardTypes.length > 0 ? cardTypes[cardTypes.length - 1] : ''
    return lastCardType
}

export const getCardTypes = (cardData: CardData) => {
    const cardTypesMatch = cardData.type_line.replace(/basic|legendary/ig, '').match(/[\w ]+(?=—{0,1})/)
    const cardTypeLine = cardTypesMatch ? cardTypesMatch[0] : ''
    const cardTypes = cardTypeLine.trim().split(' ')
    return cardTypes
}

export const getCardSubTypes = (cardData: CardData) => {
    const cardTypesMatch = cardData.type_line.match(/(?<=—)[\w ]+/)
    const cardTypeLine = cardTypesMatch ? (cardTypesMatch[0] ?? '') : ''

    if (!cardTypeLine) {
        return getCardTypes(cardData)
    }

    const cardTypes = cardTypeLine.trim().split(' ')
    return cardTypes
}

export const getCardPrice = (cardData: CardData, currency: UserData['settings']['currency'] = 'usd') => {
    if (currency === 'eur') {
        return cardData.prices.eur || cardData.prices.eur_foil
    }

    if (currency === 'usd') {
        return cardData.prices.usd || cardData.prices.usd_foil
    }

    return cardData.prices.usd
}

export const getCardPriceWithCurrency = (cardData: CardData, currency: UserData['settings']['currency'] = 'usd') => {
    return addCurrencyToText(getCardPrice(cardData, currency), currency)
}

export const getCardColorPriority = (cardData: CardData) => {
    if (!cardData.colors) {
        return 100
    }

    if (cardData.colors.length === 0) {
        return getLastCardType(cardData) === 'Land'
            ? LAND_ORDER_PRIORITY
            : COLORLESS_ORDER_PRIORITY
    }

    if (cardData.colors.length === 1) {
        return COLOR_ORDER_PRIORITY[cardData.colors[0]]
    }

    return COLOR_COMBINATION_ORDER_PRIORITY[COLOR_COMBINATIONS_MAP[cardData.colors.join('')]]
}

export const getCardDroppedFromOutside = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files.length === 0) {
        return
    }

    const fileName = e.dataTransfer.files[0].name
    const scryfallMatch = fileName.match(/(?<=.+-.+-).+(?=\.jpg)/)
    const marketPlaceMatch = fileName.match(/^\d+(?=\.jpg)/)

    if (scryfallMatch) {
        // scryfall match
        const cardName = scryfallMatch[0]

        const params = new URLSearchParams([['fuzzy', cardName]]);
        const requestResult = await fetch(`https://api.scryfall.com/cards/named?${params}`)
        const result = await requestResult.json()

        const cardData = result

        if (!cardData.status) {
            return cardData as CardData
        }
    }

    if (marketPlaceMatch) {
        // cardmarket or tcgplayer match
        const cardName = marketPlaceMatch[0]

        const cardMarketRequestResult = await fetch(`https://api.scryfall.com/cards/cardmarket/${cardName}`)
        const cardMarketResult = await cardMarketRequestResult.json()
        const cardMarketCardData = cardMarketResult
        if (!cardMarketCardData.status) {
            return cardMarketCardData as CardData
        }

        const tcgPlayerRequestResult = await fetch(`https://api.scryfall.com/cards/tcgplayer/${cardName}`)
        const tcgPlayerResult = await tcgPlayerRequestResult.json()
        const tcgPlayerCardData = tcgPlayerResult
        if (!tcgPlayerCardData.status) {
            return tcgPlayerCardData as CardData
        }
    }

    return
}

export const getCardColorIdentityCombination = (cardData: CardData) => {
    if (!cardData.color_identity) {
        return ''
    }

    const cardColorIdentityCombination = cardData.color_identity.join('')

    return COLOR_COMBINATIONS_MAP[cardColorIdentityCombination]
        ? COLOR_COMBINATIONS_MAP[cardColorIdentityCombination]
        : cardColorIdentityCombination
}

export const isCardDoubleFaced = (card: CardData) => {
    return card.card_faces && !card.colors
}
