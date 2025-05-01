import React, { createContext } from "react";
import { BaseCardData, CardData, CardDictionary, Deck, Decks } from "../types";
import { COLOR_ORDER_PRIORITY } from "../data/search";

type AppContextType = {
    currentDeckID: string
    // decks: Decks
    // createDeck: (name: string, format?: string) => void
    // allCards: CardData[]
    cardDictionary: CardDictionary // Card name to card data
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

const USD_TO_EUR_CONVERSION = 0.87

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
    const [currentDeckID, setCurrentDeckID] = React.useState('')
    const [cardDictionary, setCardDictionary] = React.useState<CardDictionary>({})

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

    return <AppContext.Provider value={{ currentDeckID, cardDictionary }}>
        {children}
    </AppContext.Provider>
}