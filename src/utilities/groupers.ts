import { COLORLESS_DATA } from "../data/search";
import { CardDictionary, CardGroupData, CardGrouper, DeckCards, GroupBy } from "../types";
import { getCardSubTypes, getCardTypes } from "./card";

const convertGroupRecordToGroupData = (groups: Record<string, string[]>) => {
    const groupData = Object.keys(groups).map<CardGroupData>(groupName => ({ name: groupName, cards: groups[groupName] }))
    return groupData
}

export const groupCardsByCategory = (deckCards: DeckCards) => {
    const groups: Record<string, string[]> = {}

    Object.keys(deckCards).forEach(cardName => {
        deckCards[cardName].categories.forEach(category => {
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push(cardName)
        })
    })

    return convertGroupRecordToGroupData(groups).sort((groupA, groupB) => groupA.name.localeCompare(groupB.name))
}

export const groupCardsByManaValue = (deckCards: DeckCards, cardDictionary: CardDictionary) => {
    const groups: Record<string, string[]> = {}

    Object.keys(deckCards).forEach(cardName => {
        if (!groups[cardDictionary[cardName].cmc]) {
            groups[cardDictionary[cardName].cmc] = []
        }
        groups[cardDictionary[cardName].cmc].push(cardName)
    })

    return convertGroupRecordToGroupData(groups).sort((groupA, groupB) => parseInt(groupA.name) - parseInt(groupB.name))
}

// Alternative for this grouper is excluding creatures from artifacts and enchantments if the card has multiple types
export const groupCardsByType = (deckCards: DeckCards, cardDictionary: CardDictionary, alternative: boolean) => {
    const groups: Record<string, string[]> = {}

    Object.keys(deckCards).forEach(cardName => {
        const cardTypes = getCardTypes(cardDictionary[cardName])
        // if(alternative && cardTypes.length > 1 && cardTypes.includes('Creature')){
        //     delete cardTypes['']
        // }
        cardTypes.forEach(cardType => {
            if (!groups[cardType]) {
                groups[cardType] = []
            }
            groups[cardType].push(cardName)
        })
    })

    return convertGroupRecordToGroupData(groups).sort((groupA, groupB) => groupA.name.localeCompare(groupB.name))
}

export const groupCardsBySubType = (deckCards: DeckCards, cardDictionary: CardDictionary) => {
    const groups: Record<string, string[]> = {}

    Object.keys(deckCards).forEach(cardName => {
        const cardTypes = getCardSubTypes(cardDictionary[cardName])
        cardTypes.forEach(cardType => {
            if (!groups[cardType]) {
                groups[cardType] = []
            }
            groups[cardType].push(cardName)
        })
    })

    return convertGroupRecordToGroupData(groups).sort((groupA, groupB) => groupA.name.localeCompare(groupB.name))
}

const COLOR_MISSING_GROUP_NAME = '---'
const MULTICOLOR_GROUP_NAME = 'Multicolor'

// Alternative for this grouper is grouping by color combinations for multicolored cards
export const groupCardsByColor = (deckCards: DeckCards, cardDictionary: CardDictionary, mode: 'default' | 'addMulticoloredToSingleColors' | 'expandMulticolored') => {
    const groups: Record<string, string[]> = {}

    Object.keys(deckCards).forEach(cardName => {
        if (!cardDictionary[cardName].colors) {
            if (!groups[COLOR_MISSING_GROUP_NAME]) {
                groups[COLOR_MISSING_GROUP_NAME] = []
            }
            groups[COLOR_MISSING_GROUP_NAME].push(cardName)
            return
        }

        if (cardDictionary[cardName].colors.length === 0) {
            if (!groups[COLORLESS_DATA.key]) {
                groups[COLORLESS_DATA.key] = []
            }
            groups[COLORLESS_DATA.key].push(cardName)
            return
        }

        if (cardDictionary[cardName].colors.length === 1) {
            if (!groups[cardDictionary[cardName].colors[0]]) {
                groups[cardDictionary[cardName].colors[0]] = []
            }
            groups[cardDictionary[cardName].colors[0]].push(cardName)
            return
        }

        if (mode === 'addMulticoloredToSingleColors') {
            cardDictionary[cardName].colors.forEach(color => {
                if (!groups[color]) {
                    groups[color] = []
                }
                groups[color].push(cardName)
            })
        }
        else if (mode === 'expandMulticolored') {

        }
        else {
            if (!groups[MULTICOLOR_GROUP_NAME]) {
                groups[MULTICOLOR_GROUP_NAME] = []
            }
            groups[MULTICOLOR_GROUP_NAME].push(cardName)
        }
    })

    return convertGroupRecordToGroupData(groups)
}

// export const CARD_GROUPERS: Record<GroupBy, CardGrouper> = {
//     "mana-value": groupCardsByManaValue,
//     type: groupCardsByType,
//     "sub-type": groupCardsBySubType,
//     color: groupCardsByColor,
//     category: groupCardsByCategory
// }