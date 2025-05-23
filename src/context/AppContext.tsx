import React, { createContext, useContext } from "react";
import { CardData, CardDictionary, SortType } from "../types";
import { SORT_TYPES } from "../data/search";
import { UserContext } from "./UserContext";

type AppContextType = {
    // currentDeckID: string
    // decks: Decks
    // createDeck: (name: string, format?: string) => void
    // allCards: CardData[]
    cardDictionary: CardDictionary // Card name to card data
    getCardPriceDisplay: (cardData: CardData) => string
    availableSortTypes: SortType[]
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

const USD_TO_EUR_CONVERSION = 0.87

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
    // const [currentDeckID, setCurrentDeckID] = React.useState('')
    const [cardDictionary, setCardDictionary] = React.useState<CardDictionary>({})
    const { userData } = useContext(UserContext)

    React.useEffect(() => {
        const getBulkData = async () => {
            const bulkDataID = '27bf3214-1271-490b-bdfe-c0be6c23d02e' // Oracle Cards
            const requestResult = await fetch(`https://api.scryfall.com/bulk-data/${bulkDataID}`)
            const result = await requestResult.json()

            if (!result.download_uri) {
                return
            }

            const downloadRequest = await fetch(result.download_uri)
            const cardData: CardData[] = await downloadRequest.json()

            console.log('Fetched cards data')

            const cardDict = cardData.reduce<CardDictionary>((dict, card) => {
                if (Object.values(card.legalities).every(legality => legality === 'not_legal')) {
                    return dict
                }

                if (!card.prices.eur) {
                    const convertedPrice = parseFloat(card.prices.usd ?? 0) * USD_TO_EUR_CONVERSION
                    card.prices.eur = convertedPrice.toFixed(2).toString()
                }
                if (!card.prices.eur_foil) {
                    const convertedPrice = parseFloat(card.prices.usd_foil ?? 0) * USD_TO_EUR_CONVERSION
                    card.prices.eur_foil = convertedPrice.toFixed(2).toString()
                }

                // if (card.colors) {
                //     card.colors.sort((colorA, colorB) => COLOR_ORDER_PRIORITY[colorA] - COLOR_ORDER_PRIORITY[colorB])
                // }
                // if (card.color_identity) {
                //     card.color_identity.sort((colorA, colorB) => COLOR_ORDER_PRIORITY[colorA] - COLOR_ORDER_PRIORITY[colorB])
                // }

                dict[card.name] = card
                return dict
            }, {})

            setCardDictionary(cardDict)
        }

        setTimeout(getBulkData, 1000)
    }, [])

    const getCardPriceDisplay = React.useCallback((cardData: CardData) => {
        if (!userData) {
            return '---'
        }

        if (userData.settings.currency === 'eur') {
            if (cardData.prices.eur !== '0.00') {
                return `€${cardData.prices.eur}`
            }
            if (cardData.prices.eur_foil !== '0.00') {
                return `€${cardData.prices.eur_foil}`
            }
        }
        else {
            if (cardData.prices.usd !== '0.00') {
                return `$${cardData.prices.usd}`
            }
            if (cardData.prices.usd_foil !== '0.00') {
                return `$${cardData.prices.usd_foil}`
            }
        }

        return '---'
    }, [userData?.settings.currency])

    const availableSortTypes = React.useMemo(() => {
        if (!userData) {
            return []
        }

        return SORT_TYPES.filter(sort => {
            if (sort === 'price-eur') {
                return userData?.settings.currency === 'eur'
            }

            if (sort === 'price-usd') {
                return userData?.settings.currency === 'usd'
            }

            return true
        })
    }, [userData?.settings.currency])

    return <AppContext.Provider value={{ cardDictionary, getCardPriceDisplay, availableSortTypes }}>
        {children}
    </AppContext.Provider>
}