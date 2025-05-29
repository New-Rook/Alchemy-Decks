import React, { useContext } from "react"
import { AppContext } from "../../context/AppContext"
import { COMMANDER_PARTNER_REGEX, COMMANDER_PARTNER_WITH_REGEX, COMMANDER_CHOOSE_A_BACKGROUND_REGEX, COMMANDER_FRIENDS_FOREVER_REGEX, COMMANDER_DOCTORS_COMPANION_REGEX, COMMANDER_BACKGROUND_REGEX, COMMANDER_TIME_LORD_DOCTOR_REGEX, LEGENDARY_REGEX, CREATURE_REGEX, CAN_BE_YOUR_COMMANDER_REGEX } from "../../data/editor"
import { DeckCard, Format } from "../../types"

export const useCommanders = (format: Format, commanders: string[], setDeckCards: React.Dispatch<React.SetStateAction<Record<string, DeckCard>>>) => {
    const { cardDictionary } = useContext(AppContext)

    // const [commanders, setCommanders] = React.useState<string[]>([])

    const availableCommanders = React.useMemo(() => {
        const legalCommanders = Object.keys(cardDictionary).filter(
            cardName => LEGENDARY_REGEX.test(cardDictionary[cardName].type_line)
                && (CREATURE_REGEX.test(cardDictionary[cardName].type_line)
                    || CAN_BE_YOUR_COMMANDER_REGEX.test(cardDictionary[cardName].oracle_text))
                && cardDictionary[cardName].legalities[format] === 'legal'
        )

        let partnerCommanders: string[] | undefined = undefined

        // Check for partner commanders

        if (commanders.length > 0) {
            const firstCommanderName = commanders[0]
            const firstCommanderOracleText = cardDictionary[firstCommanderName].oracle_text

            if (COMMANDER_PARTNER_REGEX.test(firstCommanderOracleText)) {
                partnerCommanders = Object.keys(cardDictionary).filter(
                    cardName => COMMANDER_PARTNER_REGEX.test(cardDictionary[cardName].oracle_text)
                )
            }

            if (COMMANDER_PARTNER_WITH_REGEX.test(firstCommanderOracleText) && cardDictionary[firstCommanderName].all_parts) {
                const partnerCard = cardDictionary[firstCommanderName].all_parts?.find(card =>
                    card.component === 'combo_piece' && card.name !== firstCommanderName
                )
                partnerCommanders = partnerCard ? [partnerCard.name] : undefined
            }

            if (COMMANDER_CHOOSE_A_BACKGROUND_REGEX.test(firstCommanderOracleText)) {
                partnerCommanders = Object.keys(cardDictionary).filter(cardName =>
                    COMMANDER_BACKGROUND_REGEX.test(cardDictionary[cardName].type_line)
                )
            }

            if (COMMANDER_FRIENDS_FOREVER_REGEX.test(firstCommanderOracleText)) {
                partnerCommanders = Object.keys(cardDictionary).filter(cardName =>
                    COMMANDER_FRIENDS_FOREVER_REGEX.test(cardDictionary[cardName].oracle_text)
                )
            }

            if (COMMANDER_TIME_LORD_DOCTOR_REGEX.test(cardDictionary[firstCommanderName].type_line)) {
                partnerCommanders = Object.keys(cardDictionary).filter(cardName =>
                    COMMANDER_DOCTORS_COMPANION_REGEX.test(cardDictionary[cardName].oracle_text)
                )
            }
        }

        return { legalCommanders, partnerCommanders }
    }, [format, commanders])

    const setFirstCommander = (cardName: string) => {
        let secondCommanderIncompatible = true

        const newFirstCommanderName = cardName
        const firstCommanderName = commanders[0]
        const secondCommanderName = commanders[1]

        if (secondCommanderName) {
            const newFirstCommanderOracleText = cardDictionary[newFirstCommanderName].oracle_text
            const secondCommanderOracleText = cardDictionary[secondCommanderName].oracle_text

            if (
                COMMANDER_PARTNER_REGEX.test(newFirstCommanderOracleText)
                && COMMANDER_PARTNER_REGEX.test(secondCommanderOracleText)
            ) {
                secondCommanderIncompatible = false
            }

            if (COMMANDER_PARTNER_WITH_REGEX.test(newFirstCommanderOracleText) && cardDictionary[newFirstCommanderName].all_parts) {
                const partnerCard = cardDictionary[newFirstCommanderName].all_parts?.find(card =>
                    card.component === 'combo_piece' && card.name !== newFirstCommanderName
                )
                if (partnerCard && partnerCard.name === secondCommanderName) {
                    secondCommanderIncompatible = false
                }
            }

            if (
                COMMANDER_CHOOSE_A_BACKGROUND_REGEX.test(newFirstCommanderOracleText)
                && COMMANDER_BACKGROUND_REGEX.test(cardDictionary[secondCommanderName].type_line)
            ) {
                secondCommanderIncompatible = false
            }

            if (
                COMMANDER_FRIENDS_FOREVER_REGEX.test(newFirstCommanderOracleText)
                && COMMANDER_FRIENDS_FOREVER_REGEX.test(secondCommanderOracleText)
            ) {
                secondCommanderIncompatible = false
            }

            if (
                COMMANDER_TIME_LORD_DOCTOR_REGEX.test(cardDictionary[newFirstCommanderName].type_line)
                && COMMANDER_DOCTORS_COMPANION_REGEX.test(secondCommanderOracleText)
            ) {
                secondCommanderIncompatible = false
            }
        }

        setDeckCards((prev) => {
            const newDeckCards = { ...prev }

            if (firstCommanderName) {
                delete newDeckCards[firstCommanderName]
            }

            newDeckCards[cardName] = {
                boards: { mainboard: 1 },
                commanderNumber: 1
            }
            console.log({ secondCommanderIncompatible })
            if (secondCommanderIncompatible) {
                delete newDeckCards[secondCommanderName]
            }

            return newDeckCards
        })
    }

    const setSecondCommander = (cardName: string) => {
        setDeckCards((prev) => {
            const newDeckCards = { ...prev }

            const secondCommanderName = commanders[1]

            if (secondCommanderName) {
                delete newDeckCards[secondCommanderName]
            }

            newDeckCards[cardName] = {
                boards: { mainboard: 1 },
                commanderNumber: 2
            }

            return newDeckCards
        })
    }

    const removeSecondCommander = () => {
        setDeckCards((prev) => {
            const newDeckCards = { ...prev }

            const secondCommanderName = commanders[1]

            if (secondCommanderName) {
                delete newDeckCards[secondCommanderName]
            }

            return newDeckCards
        })
    }

    return { availableCommanders, setFirstCommander, setSecondCommander, removeSecondCommander }
}