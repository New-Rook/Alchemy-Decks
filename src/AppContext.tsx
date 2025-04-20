import React, { createContext } from "react";
import { BaseCardData, CardData, Deck, Decks } from "./types";

type AppContextType = {
    currentDeckID: string
    // decks: Decks
    // createDeck: (name: string, format?: string) => void
    // allCards: CardData[]
    cardDictionary: Record<string, CardData> // Card name to card data
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export const AppContextProvider = ({ children }: React.PropsWithChildren) => {
    const [currentDeckID, setCurrentDeckID] = React.useState('')
    // const [decks, setDecks] = React.useState<Decks>(new Map())
    // const [allCards, setAllCards] = React.useState<CardData[]>([])
    const [cardDictionary, setCardDictionary] = React.useState<Record<string, CardData>>({})

    const createDeck = (name: string, format = '') => {
        const id = crypto.randomUUID()
        const deck: Deck = {
            name,
            cards: {},
            format: "standard"
        }

        // setDecks(new Map(decks).set(id, deck))
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
            // const bulkDataID = '27bf3214-1271-490b-bdfe-c0be6c23d02e' // Oracle Cards
            // const bulkDataID = '6bbcf976-6369-4401-88fc-3a9e4984c305' // Unique Artwork
            const bulkDataID = 'e2ef41e3-5778-4bc2-af3f-78eca4dd9c23' // Default Cards
            const requestResult = await fetch(`https://api.scryfall.com/bulk-data/${bulkDataID}`)
            const result = await requestResult.json()

            if (!result.download_uri) {
                return
            }

            // const downloadRequest = await fetch(result.download_uri)
            // const cardData: CardData[] = await downloadRequest.json()
            // // console.log(cardData)
            // console.log(cardData.filter(data => data.name === 'Sol Ring'))

            // const filteredCardData = cardData.filter(data => Object.values(data.legalities).some(legality => legality !== 'not_legal'))

            // const cardsWithNoPrice = filteredCardData.filter(data => (!data.prices.eur && !data.prices.eur_foil) || (!data.prices.usd && !data.prices.usd_foil))
            // console.log({ le: cardsWithNoPrice.length })
            // const params = new URLSearchParams([['q', cardsWithNoPrice.reduce((fullString) => `${fullString} or`, '')], ['unique', 'prints']]);
            // const variationsRequestResult = await fetch(`https://api.scryfall.com/cards/search?${params}`)
            // const result = await requestResult.json()
            // const cards: CardData[] = result.data
            // const data = cards.filter(cardData => !cardData.digital)
            // console.log(data)

            const filteredCardData = await fetch(result.download_uri).then(async downloadRequest => {
                return await downloadRequest.json().then((cardData: CardData[]) => {
                    const indicesToRemove: number[] = []

                    cardData.forEach((data, index) => {
                        if (Object.values(data.legalities).every(legality => legality === 'not_legal')) {
                            indicesToRemove.push(index)
                        }
                    })

                    indicesToRemove.toReversed().forEach((index) => {
                        delete cardData[index]
                    })

                    const reducedData = cardData.reduce<Record<string, CardData>>((oracleUniqueData, data) => {
                        // If either currency prices are missing, then check if this print has prices
                        if (oracleUniqueData[data.name] &&
                            ((!oracleUniqueData[data.name].prices.eur && !oracleUniqueData[data.name].prices.eur_foil)
                                || (!oracleUniqueData[data.name].prices.usd && !oracleUniqueData[data.name].prices.usd_foil)
                                && data.prices)
                        ) {

                        }
                        oracleUniqueData[data.name] = data
                        return oracleUniqueData
                    }, {})

                    return reducedData
                })
            })

            // const cardDict = filteredCardData.reduce<Record<string, CardData>>((dict, cardData) => {
            //     dict[cardData.name] = cardData
            //     return dict
            // }, {})

            // setAllCards(filteredCardData)
            // setCardDictionary(cardDict)
            setCardDictionary(filteredCardData)
        }

        getBulkData()
    }, [])

    return <AppContext.Provider value={{ currentDeckID, cardDictionary }}>
        {children}
    </AppContext.Provider>
}