import { COLOR_ORDER_PRIORITY, COLORLESS_ORDER_PRIORITY, LAND_ORDER_PRIORITY, MULTICOLOR_ORDER_PRIORITY } from "../data/search";
import { CardData } from "../types";

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

export const getLastCardType = (cardData: CardData) => {
    const cardTypesMatch = cardData.type_line.match(/[\w ]+(?=—{0,1})/)
    const cardTypeLine = cardTypesMatch ? cardTypesMatch[0] : ''
    const cardTypes = cardTypeLine.split(' ')
    const lastCardType = cardTypes ? cardTypes[cardTypes.length - 1] : ''
    return lastCardType
}

export const getCardTypes = (cardData: CardData) => {
    const cardTypesMatch = cardData.type_line.match(/[\w ]+(?=—{0,1})/)
    const cardTypeLine = cardTypesMatch ? cardTypesMatch[0] : ''
    const cardTypes = cardTypeLine.split(' ')
    return cardTypes
}

export const getCardSubTypes = (cardData: CardData) => {
    const cardTypesMatch = cardData.type_line.match(/[\w ]+(?=—{0,1})/)
    const cardTypeLine = cardTypesMatch ? (cardTypesMatch[1] ?? '') : ''
    const cardTypes = cardTypeLine.split(' ')
    return cardTypes
}

export const getCardColorPriority = (cardData: CardData) => {
    if (!cardData.colors) {
        return 0
    }

    if (cardData.colors.length === 1) {
        return COLOR_ORDER_PRIORITY[cardData.colors[0]]
    }

    if (cardData.colors.length === 0) {
        const isLand = getLastCardType(cardData) === 'Land'
        return isLand ? LAND_ORDER_PRIORITY : COLORLESS_ORDER_PRIORITY
    }

    return MULTICOLOR_ORDER_PRIORITY
}