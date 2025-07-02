import React, { useContext } from "react"
import { basicLandRegex, NUMBER_NAME_MAP } from "../../data/general"
import { BoardCards, DeckCards, DeckMetaData, DeckStats, GroupByColorMode, GroupByTypeMode } from "../../types"
import { getCardAllOracleText, getCardColorIdentityCombination } from "../../utilities/card"
import { numberToDecimalPoints } from "../../utilities/general"
import { groupCardsByCategory, groupCardsByColor, groupCardsByManaValue, groupCardsBySubType, groupCardsByType } from "../../utilities/groupers"
import { AppContext } from "../../context/AppContext"
import { ALTERNATE_QUANTITY_REGEX, INFINITE_QUANTITY_REGEX, LEGALITY_WARNING_NUMBER_OF_COPIES } from "../../data/editor"

type Props = {
    deckMetaData: DeckMetaData,
    deckCards: DeckCards,
    mainboard: BoardCards,
    sideboard: BoardCards,
    commanders: string[]
    commanderColorIdentity: string | null,
    groupByColorMode: GroupByColorMode,
    groupByTypeMode: GroupByTypeMode
}

// export const useDeckStats = (deckMetaData: DeckMetaData, deckCards: DeckCards, mainboard: BoardCards, sideboard: BoardCards, groupByColorMode: GroupByColorMode, groupByTypeLastCardTypeOnly: boolean) => {
export const useDeckStats = ({
    deckMetaData,
    deckCards,
    mainboard,
    sideboard,
    commanders,
    commanderColorIdentity,
    groupByColorMode,
    groupByTypeMode
}: Props) => {
    const { cardDictionary } = useContext(AppContext)

    const deckStats = React.useMemo<DeckStats>(() => {
        let numberOfMainboardCards = 0
        let numberOfSideboardCards = 0
        let mainboardPrice = 0
        let sideboardPrice = 0
        let legal = true
        const legalityWarnings: Record<string, string> = {}
        const deckLegalityWarnings: string[] = []

        Object.keys(deckCards).forEach((cardName) => {
            const mainboardCardQuantity = deckCards[cardName].boards.mainboard ?? 0
            numberOfMainboardCards += mainboardCardQuantity
            mainboardPrice += mainboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const sideboardCardQuantity = deckCards[cardName].boards.sideboard ?? 0
            numberOfSideboardCards += sideboardCardQuantity
            sideboardPrice += sideboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const cardQuantity = mainboardCardQuantity + sideboardCardQuantity

            const alternateQuantityMatch = getCardAllOracleText(cardDictionary[cardName]).match(ALTERNATE_QUANTITY_REGEX)
            const alternateQuantity = alternateQuantityMatch ? NUMBER_NAME_MAP[alternateQuantityMatch[0]] : undefined
            const infiniteQuantity = INFINITE_QUANTITY_REGEX.test(cardDictionary[cardName].oracle_text)

            const legality = cardDictionary[cardName].legalities[deckMetaData.format]

            if (legality === 'not_legal') {
                legalityWarnings[cardName] = `This card is not legal in ${deckMetaData.format}.`
            }
            else if (legality === 'banned') {
                legalityWarnings[cardName] = `This card is banned in ${deckMetaData.format}.`
            }
            else if (commanderColorIdentity !== null && !commanderColorIdentity.includes(getCardColorIdentityCombination(cardDictionary[cardName]))) {
                legalityWarnings[cardName] = `This card's color identity is not within your commander's color identity.`
            }
            else if (
                !infiniteQuantity && (
                    (alternateQuantity && cardQuantity > alternateQuantity)
                    || (deckMetaData.format === 'commander' && cardQuantity > 1)
                    || (legality === 'restricted' && cardQuantity > 1)
                    || cardQuantity > 4
                )
            ) {
                legalityWarnings[cardName] = `${LEGALITY_WARNING_NUMBER_OF_COPIES} ${deckMetaData.format}.`
            }
        })

        const getCardBoardTypes = (board: Record<string, number>) => {
            const mainboardCards = Object.keys(board)

            const categories = groupCardsByCategory(deckCards, mainboardCards, cardDictionary)
            const colors = groupCardsByColor(mainboardCards, cardDictionary, groupByColorMode)
            const manaValues = groupCardsByManaValue(mainboardCards, cardDictionary)
            const subTypes = groupCardsBySubType(mainboardCards, cardDictionary)
            const types = groupCardsByType(mainboardCards, cardDictionary, groupByTypeMode)

            return { categories, colors, manaValues, subTypes, types }
        }

        const mainboardCardStats = getCardBoardTypes(mainboard)
        const sideboardCardStats = getCardBoardTypes(sideboard)

        if (deckMetaData.format === 'commander') {
            if (commanders.length === 0) {
                deckLegalityWarnings.push('The deck must contain a commander.')
            }
            if (numberOfMainboardCards !== 100) {
                deckLegalityWarnings.push('The deck must contain exactly 100 cards, including the commander.')
            }
        } else {
            if (numberOfMainboardCards < 60) {
                deckLegalityWarnings.push('The Main Deck must contain at least 60 cards.')
            }
            if (numberOfSideboardCards > 15) {
                deckLegalityWarnings.push('The Sideboard cannot contain more than 15 cards.')
            }
        }

        return {
            mainboard: { numberOfCards: numberOfMainboardCards, price: numberToDecimalPoints(mainboardPrice, 2), cardStats: mainboardCardStats },
            sideboard: { numberOfCards: numberOfSideboardCards, price: numberToDecimalPoints(sideboardPrice, 2), cardStats: sideboardCardStats },
            legal,
            legalityWarnings,
            deckLegalityWarnings
        }
    }, [deckCards, mainboard, sideboard, cardDictionary, deckMetaData, commanders, commanderColorIdentity, groupByColorMode, groupByTypeMode])

    return deckStats
}