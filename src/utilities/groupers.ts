import { CARD_TYPE_LAND, NO_CATEGORY_CREATURE_GROUP_NAME, NO_CATEGORY_LAND_GROUP_NAME, NO_CATEGORY_REGEX, NO_CATEGORY_TERM } from "../data/editor";
import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_COMBINATIONS_MAP, COLOR_ORDER_PRIORITY, COLORLESS_DATA, COLORLESS_ORDER_PRIORITY, LAND_ORDER_PRIORITY } from "../data/search";
import { CardDictionary, CardGroupData, Color, DeckCards, GroupByColorMode, GroupByTypeMode } from "../types";
import { getCardColors, getCardSubTypes, getCardTypes, getLastCardType } from "./card";

const LAND_GROUP_NAME = CARD_TYPE_LAND
const COLOR_MISSING_GROUP_NAME = '---'
const MULTICOLOR_GROUP_NAME = 'Multicolored'

const convertGroupRecordToGroupData = (groups: Record<string, string[]>) => {
    const groupData = Object.keys(groups).map<CardGroupData>(groupName => ({ name: groupName, cards: groups[groupName] }))
    return groupData
}

const sorterLandGroupAtEnd = (sorter: (groupA: CardGroupData, groupB: CardGroupData) => number) => {
    return (groupA: CardGroupData, groupB: CardGroupData) => {
        if (groupA.name === LAND_GROUP_NAME) {
            return 1
        }
        if (groupB.name === LAND_GROUP_NAME) {
            return - 1
        }

        return sorter(groupA, groupB)
    }
}

export const groupCardsByCategory = (deckCards: DeckCards, boardCards: string[], cardDictionary: CardDictionary) => {
    const groups: Record<string, string[]> = {}

    boardCards.forEach(cardName => {
        if (!deckCards[cardName].categories) {
            const groupName = `${NO_CATEGORY_TERM} ${getLastCardType(cardDictionary[cardName])}`
            if (!groups[groupName]) {
                groups[groupName] = []
            }
            groups[groupName].push(cardName)
            return
        }

        deckCards[cardName].categories.forEach(category => {
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push(cardName)
        })
    })

    return convertGroupRecordToGroupData(groups).sort((groupA, groupB) => {
        const groupAHasNoCategory = NO_CATEGORY_REGEX.test(groupA.name)
        const groupBHasNoCategory = NO_CATEGORY_REGEX.test(groupB.name)

        if (groupBHasNoCategory && !groupAHasNoCategory) {
            return -1
        }
        if (groupAHasNoCategory && !groupBHasNoCategory) {
            return 1
        }
        if (groupAHasNoCategory && groupBHasNoCategory) {
            if (groupA.name === NO_CATEGORY_CREATURE_GROUP_NAME || groupB.name === NO_CATEGORY_LAND_GROUP_NAME) {
                return -1
            }
            if (groupB.name === NO_CATEGORY_CREATURE_GROUP_NAME || groupA.name === NO_CATEGORY_LAND_GROUP_NAME) {
                return 1
            }
        }

        return groupA.name.localeCompare(groupB.name)
    })
}

export const groupCardsByManaValue = (boardCards: string[], cardDictionary: CardDictionary) => {
    const groups: Record<string, string[]> = {}

    boardCards.forEach(cardName => {
        if (cardDictionary[cardName].cmc === 0 && getLastCardType(cardDictionary[cardName]) === 'Land') {
            if (!groups[LAND_GROUP_NAME]) {
                groups[LAND_GROUP_NAME] = []
            }
            groups[LAND_GROUP_NAME].push(cardName)
            return
        }

        if (!groups[cardDictionary[cardName].cmc]) {
            groups[cardDictionary[cardName].cmc] = []
        }
        groups[cardDictionary[cardName].cmc].push(cardName)
    })

    return convertGroupRecordToGroupData(groups).sort(sorterLandGroupAtEnd((groupA, groupB) => parseInt(groupA.name) - parseInt(groupB.name)))
}

// Alternative for this grouper is excluding creatures from artifacts and enchantments if the card has multiple types
export const groupCardsByType = (boardCards: string[], cardDictionary: CardDictionary, mode: GroupByTypeMode) => {
    const groups: Record<string, string[]> = {}

    boardCards.forEach(cardName => {
        if (mode === 'only-last-type') {
            const lastCardType = getLastCardType(cardDictionary[cardName])
            if (!groups[lastCardType]) {
                groups[lastCardType] = []
            }
            groups[lastCardType].push(cardName)
        }
        else {
            const cardTypes = getCardTypes(cardDictionary[cardName])
            cardTypes.forEach(cardType => {
                if (!groups[cardType]) {
                    groups[cardType] = []
                }
                groups[cardType].push(cardName)
            })
        }
        // if(alternative && cardTypes.length > 1 && cardTypes.includes('Creature')){
        //     delete cardTypes['']
        // }

    })

    return convertGroupRecordToGroupData(groups).sort(sorterLandGroupAtEnd((groupA, groupB) => groupA.name.localeCompare(groupB.name)))
}

export const groupCardsBySubType = (boardCards: string[], cardDictionary: CardDictionary) => {
    const groups: Record<string, string[]> = {}

    boardCards.forEach(cardName => {
        const cardTypes = getCardSubTypes(cardDictionary[cardName])
        cardTypes.forEach(cardType => {
            if (!groups[cardType]) {
                groups[cardType] = []
            }
            groups[cardType].push(cardName)
        })
    })

    return convertGroupRecordToGroupData(groups).sort(sorterLandGroupAtEnd((groupA, groupB) => groupA.name.localeCompare(groupB.name)))
}

// Alternative for this grouper is grouping by color combinations for multicolored cards
export const groupCardsByColor = (boardCards: string[], cardDictionary: CardDictionary, mode: GroupByColorMode) => {
    const groups: Record<string, string[]> = {}

    boardCards.forEach(cardName => {
        const cardColors = getCardColors(cardDictionary[cardName])

        if (!cardColors) {
            if (!groups[COLOR_MISSING_GROUP_NAME]) {
                groups[COLOR_MISSING_GROUP_NAME] = []
            }
            groups[COLOR_MISSING_GROUP_NAME].push(cardName)
            return
        }

        if (cardColors.length === 0) {
            if (getLastCardType(cardDictionary[cardName]) === 'Land') {
                if (!groups[LAND_GROUP_NAME]) {
                    groups[LAND_GROUP_NAME] = []
                }
                groups[LAND_GROUP_NAME].push(cardName)
            } else {
                if (!groups[COLORLESS_DATA.key]) {
                    groups[COLORLESS_DATA.key] = []
                }
                groups[COLORLESS_DATA.key].push(cardName)
            }
            return
        }

        if (cardColors.length === 1) {
            if (!groups[cardColors[0]]) {
                groups[cardColors[0]] = []
            }
            groups[cardColors[0]].push(cardName)
            return
        }

        if (mode === 'all-monocolored') {
            cardColors.forEach(color => {
                if (!groups[color]) {
                    groups[color] = []
                }
                groups[color].push(cardName)
            })
        }
        else if (mode === 'multicolored-expanded') {
            const draftColorCombination = cardColors.join('')
            const colorCombination = COLOR_COMBINATIONS_MAP[draftColorCombination]
            if (!groups[colorCombination]) {
                groups[colorCombination] = []
            }
            groups[colorCombination].push(cardName)
        }
        else {
            if (!groups[MULTICOLOR_GROUP_NAME]) {
                groups[MULTICOLOR_GROUP_NAME] = []
            }
            groups[MULTICOLOR_GROUP_NAME].push(cardName)
        }
    })

    return convertGroupRecordToGroupData(groups).sort(sorterLandGroupAtEnd((groupA, groupB) => getGroupColorPriority(groupA) - getGroupColorPriority(groupB)))
}

const getGroupColorPriority = (group: CardGroupData) => {
    if (COLOR_ORDER_PRIORITY[group.name as Color]) {
        return COLOR_ORDER_PRIORITY[group.name as Color]
    }

    if (COLOR_COMBINATION_ORDER_PRIORITY[group.name]) {
        return COLOR_COMBINATION_ORDER_PRIORITY[group.name]
    }

    if (group.name === COLORLESS_DATA.key) {
        return COLORLESS_ORDER_PRIORITY
    }

    if (group.name === LAND_GROUP_NAME) {
        return LAND_ORDER_PRIORITY
    }

    return 100
}

// export const CARD_GROUPERS: Record<GroupBy, CardGrouper> = {
//     "mana-value": groupCardsByManaValue,
//     type: groupCardsByType,
//     "sub-type": groupCardsBySubType,
//     color: groupCardsByColor,
//     category: groupCardsByCategory
// }