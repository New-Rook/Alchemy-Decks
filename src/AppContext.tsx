import React, { createContext } from "react";
import { BaseCardData, CardData, Deck, Decks } from "./types";

type AppContextType = {
    currentDeckID: string
    decks: Decks
    createDeck: (name: string, format?: string) => void
    allCards: CardData[]
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
    const [currentDeckID, setCurrentDeckID] = React.useState('')
    const [decks, setDecks] = React.useState<Decks>(new Map())
    const [allCards, setAllCards] = React.useState<CardData[]>([])

    const createDeck = (name: string, format = '') => {
        const id = crypto.randomUUID()
        const deck: Deck = {
            name,
            cards: {},
            format: "standard"
        }

        setDecks(new Map(decks).set(id, deck))
    }

    // const getBulkData = async () => {
    //     const bulkDataID = '27bf3214-1271-490b-bdfe-c0be6c23d02e'
    //     const requestResult = await fetch(`https://api.scryfall.com/bulk-data/${bulkDataID}`)
    //     console.log(requestResult)
    //     const result = await requestResult.json()
    //     console.log(result)
    //     const downloadRequest = await fetch(result.download_uri)
    //     console.log(downloadRequest)
    //     const downloadResult = await downloadRequest.json()
    //     console.log(downloadResult)
    //     setAllCards(downloadResult)
    // }

    React.useEffect(() => {
        const getBulkData = async () => {
            const bulkDataID = '27bf3214-1271-490b-bdfe-c0be6c23d02e'
            const requestResult = await fetch(`https://api.scryfall.com/bulk-data/${bulkDataID}`)
            const result = await requestResult.json()

            if (!result.download_uri) {
                return
            }

            const downloadRequest = await fetch(result.download_uri)
            const cardData: CardData[] = await downloadRequest.json()
            console.log(cardData)

            const filteredCardData = cardData.filter(data => Object.values(data.legalities).some(legality => legality !== 'not_legal'))

            setAllCards(filteredCardData)
        }

        getBulkData()
    }, [])

    return <AppContext.Provider value={{ currentDeckID, decks, createDeck, allCards }}>
        {children}
    </AppContext.Provider>
}