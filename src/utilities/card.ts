import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_COMBINATIONS_MAP, COLOR_ORDER_PRIORITY, COLORLESS_ORDER_PRIORITY, LAND_ORDER_PRIORITY } from "../data/search";
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

export const getCardFrontImage = (card: CardData) => {
    return getCardBaseData(card).image_uris
}

export const getCardImages = (card: CardData) => {
    if (card.card_faces) {
        return card.card_faces.map(cardFace => cardFace.image_uris)
    }

    return [card.image_uris]
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