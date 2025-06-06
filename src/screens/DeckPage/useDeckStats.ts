import React, { useContext } from "react"
import { basicLandRegex, NUMBER_NAME_MAP } from "../../data/general"
import { BoardCards, DeckCards, DeckMetaData, DeckStats, GroupByColorMode, GroupByTypeMode } from "../../types"
import { getCardAllOracleText } from "../../utilities/card"
import { numberToDecimalPoints } from "../../utilities/general"
import { groupCardsByCategory, groupCardsByColor, groupCardsByManaValue, groupCardsBySubType, groupCardsByType } from "../../utilities/groupers"
import { AppContext } from "../../context/AppContext"

// export const useDeckStats = (deckMetaData: DeckMetaData, deckCards: DeckCards, mainboard: BoardCards, sideboard: BoardCards, groupByColorMode: GroupByColorMode, groupByTypeLastCardTypeOnly: boolean) => {
export const useDeckStats = ({ deckMetaData, deckCards, mainboard, sideboard, groupByColorMode, groupByTypeMode }: { deckMetaData: DeckMetaData, deckCards: DeckCards, mainboard: BoardCards, sideboard: BoardCards, groupByColorMode: GroupByColorMode, groupByTypeMode: GroupByTypeMode }) => {
    const { cardDictionary } = useContext(AppContext)

    const deckStats = React.useMemo<DeckStats>(() => {
        let numberOfMainboardCards = 0
        let numberOfSideboardCards = 0
        let mainboardPrice = 0
        let sideboardPrice = 0
        let legal = true
        const legalityWarnings: Record<string, string> = {}

        Object.keys(deckCards).forEach((cardName) => {
            const mainboardCardQuantity = deckCards[cardName].boards.mainboard ?? 0
            numberOfMainboardCards += mainboardCardQuantity
            mainboardPrice += mainboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const sideboardCardQuantity = deckCards[cardName].boards.sideboard ?? 0
            numberOfSideboardCards += sideboardCardQuantity
            sideboardPrice += sideboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const cardQuantity = mainboardCardQuantity + sideboardCardQuantity

            const isBasicLand = basicLandRegex.test(cardDictionary[cardName].type_line)
            const alternateQuantityMatch = getCardAllOracleText(cardDictionary[cardName]).match(/(?<=A deck can have up to )\w+/)
            const alternateQuantity = alternateQuantityMatch ? NUMBER_NAME_MAP[alternateQuantityMatch[0]] : undefined
            const infiniteQuantity = /A deck can have any number/.test(cardDictionary[cardName].oracle_text)

            const legality = cardDictionary[cardName].legalities[deckMetaData.format]
            if (legality === 'legal' && (
                infiniteQuantity
                || (alternateQuantity && cardQuantity <= alternateQuantity)
                || (deckMetaData.format === 'commander' && cardQuantity <= 1)
                || cardQuantity <= 4
                || isBasicLand
            )) {
                return
            }
            else if (legality === 'restricted' && cardQuantity <= 1) {
                return
            }
            else {
                legal = false
                if (legality === 'not_legal') {
                    legalityWarnings[cardName] = `This card is not legal in ${deckMetaData.format}.`
                }
                else if (legality === 'banned') {
                    legalityWarnings[cardName] = `This card is banned in ${deckMetaData.format}.`
                }
                else {
                    // Quantity higher than limit
                    legalityWarnings[cardName] = `The number of copies of this card goes over the limit for ${deckMetaData.format}.`
                }
            }
        })

        const getCardBoardTypes = (board: Record<string, number>) => {
            const mainboardCards = Object.keys(board)

            const categories = groupCardsByCategory(deckCards, mainboardCards)
            const colors = groupCardsByColor(mainboardCards, cardDictionary, groupByColorMode)
            const manaValues = groupCardsByManaValue(mainboardCards, cardDictionary)
            const subTypes = groupCardsBySubType(mainboardCards, cardDictionary)
            const types = groupCardsByType(mainboardCards, cardDictionary, groupByTypeMode)

            return { categories, colors, manaValues, subTypes, types }
        }

        const mainboardCardStats = getCardBoardTypes(mainboard)
        const sideboardCardStats = getCardBoardTypes(sideboard)

        // const formats = Object.keys(legalities)
        // formats.forEach((format) => {
        //     if (!legalities[format]) {
        //         delete legalities[format]
        //     }
        // })

        return {
            mainboard: { numberOfCards: numberOfMainboardCards, price: numberToDecimalPoints(mainboardPrice, 2), cardStats: mainboardCardStats },
            sideboard: { numberOfCards: numberOfSideboardCards, price: numberToDecimalPoints(sideboardPrice, 2), cardStats: sideboardCardStats },
            legal,
            legalityWarnings
        }
    }, [deckCards, mainboard, sideboard, cardDictionary, deckMetaData])

    return deckStats
}