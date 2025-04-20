import { useContext, useState } from 'react'
import './App.css'
import React from 'react'
import { AppContext } from './AppContext'
import { useBooleanState } from './useBooleanState'
import { CardData, Deck } from './types'
import { getCardImages } from './utilities/card'
import { AuthenticationForm } from './AuthenticationForm'
import { AuthContext } from './AuthContext'
import { getDataFromDatabase, setDataToDatabase } from './api/common/database'
import { SearchWindow } from './SearchWindow'

const basicLandRegex = /Basic Land/

export const HomePage = () => {
    const [deckName, setDeckName] = useState('')
    const [deckCreationPopupVisible, showDeckCreationPopup, hideDeckCreationPopup] = useBooleanState()

    // const { decks, createDeck } = useContext(AppContext)
    const { cardDictionary } = useContext(AppContext)

    const { user } = useContext(AuthContext)

    const [categories, setCategories] = React.useState<Record<string, string[]>>({ uncategorised: [] })
    const [currentCardPosition, setCurrentCardPosition] = React.useState([0, 0])
    const [currentCardOffset, setCurrentCardOffset] = React.useState([0, 0])
    const [currentCard, setCurrentCard] = React.useState('')
    const [deckCards, setDeckCards] = React.useState<Record<string, number>>({})
    // const [deckCardData, setDeckCardData] = React.useState<Record<string, CardData>>({})
    const [cardSearchTerm, setCardSearchTerm] = React.useState('')
    const [cardSearchResults, setCardSearchResults] = React.useState<CardData[]>([])

    // console.log({ currentCard })

    const [searchWindowVisible, showSearchWindow, hideSearchWindow] = useBooleanState()


    // const [colorFilters, setColorFilters] = React.useState<Color[]>([])

    const hideSearchWindowAndCleanup = () => {
        hideSearchWindow()
    }

    // const filterColor = (color: Color) => {
    //     if (colorFilters.includes(color)) {
    //         setColorFilters(colorFilters.filter(c => c !== color))
    //     } else {
    //         setColorFilters([...colorFilters, color])
    //     }
    // }

    React.useEffect(() => {
        if (!searchWindowVisible) {
            setCardSearchTerm('')
        }
    }, [searchWindowVisible])

    // React.useEffect(() => {
    //     const getAllSets = async () => {
    //         const requestResult = await fetch('https://api.scryfall.com/cards/random')
    //         const result = await requestResult.json()
    //         console.log(result.data)
    //     }

    //     getAllSets()
    // }, [])

    // const getValidatedCardData = (cardData: CardData) => {
    //     if (!cardData.card_faces) {
    //         return cardData
    //     }

    //     const frontFace = cardData.card_faces[0]
    //     return frontFace
    // }

    const deckStats = React.useMemo(() => {
        let numberOfCards = 0
        let price = 0
        const legalities: Record<string, boolean> = {}

        Object.keys(deckCards).forEach((cardName) => {
            const cardQuantity = deckCards[cardName]
            numberOfCards += cardQuantity
            price += cardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)
            if (!basicLandRegex.test(cardDictionary[cardName].type_line)) {
                Object.keys(cardDictionary[cardName].legalities).forEach(format => {
                    if (legalities[format] === false) {
                        return
                    }

                    const legality = cardDictionary[cardName].legalities[format]
                    if (legality === 'legal' && ((format === 'commander' && cardQuantity <= 1) || cardQuantity <= 4)) {
                        legalities[format] = true
                    }
                    else if (legality === 'restricted' && cardQuantity <= 1) {
                        legalities[format] = true
                    }
                    else {
                        legalities[format] = false
                    }
                })
            }
        })

        const formats = Object.keys(legalities)
        formats.forEach((format) => {
            if (!legalities[format]) {
                delete legalities[format]
            }
        })

        return { numberOfCards, price, legalities }
    }, [deckCards, cardDictionary])

    const searchCard = async () => {
        try {
            console.log('search')
            const params = new URLSearchParams([['q', cardSearchTerm]]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/search?${params}`)
            const result = await requestResult.json()
            const cards: CardData[] = result.data
            // const data = await Promise.all(cards.filter(cardData => !cardData.digital).slice(0, 5).map((cardData) => {
            //     // console.log('id', cardData)



            //     // if (!cardData.card_faces) {
            //     //     console.log('id', cardData.id)
            //     //     return cardData
            //     // }

            //     // const frontFace = cardData.card_faces[0]

            //     // console.log({ frontFace })

            //     // return frontFace

            //     // console.log('id', cardData)
            //     // if (!cardData.all_parts) {
            //     //     console.log('id', cardData.id)
            //     //     return cardData
            //     // }

            //     // const cardPart = cardData.all_parts.find(part => part.id === cardData.id)

            //     // console.log({ cardPart })

            //     // if (cardPart) {
            //     //     const partRequestResult = await fetch(cardPart.uri)
            //     //     const partResult = await partRequestResult.json()
            //     //     console.log(cardPart.id, partResult)
            //     //     // return 
            //     // }

            //     // return {
            //     //     ...cardData, image_uris: {
            //     //         small: null,
            //     //         normal: null,
            //     //         large: null,
            //     //         png: null,
            //     //         art_crop: null,
            //     //         border_crop: null
            //     //     }
            //     // }
            // }))

            const data = cards.filter(cardData => !cardData.digital)
            console.log(data)
            setCardSearchResults(data)
        }
        catch (err) {
            console.log('error: no results')
        }
    }

    const onChangeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardSearchTerm(e.target.value)
    }

    React.useEffect(() => {
        if (searchWindowVisible) {
            return
        }

        if (!cardSearchTerm) {
            setCardSearchResults([])
            return
        }

        const timeoutID = setTimeout(searchCard, 1000)

        return () => clearTimeout(timeoutID)
    }, [searchWindowVisible, cardSearchTerm])

    const getRandomCard = async () => {
        try {
            const params = new URLSearchParams([['q', 'niv mizzet']]);
            console.log(params.toString())
            // const requestResult = await fetch(`https://api.scryfall.com/cards/named?${params}`)
            const requestResult = await fetch(`https://api.scryfall.com/cards/random?${params}`)
            console.log(requestResult)
            const result = await requestResult.json()
            console.log(result)
            if (result.object === 'error') {
                return
            }
            const cardData = result
            // setCardImages(prevImages => [...prevImages, cardData['image_uris'].normal])
            setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
            // setDeckCardData(prev => ({ ...prev, [cardData.name]: cardData }))
        }
        catch {
            console.log('error: no random card')
        }
    }

    const copyDeckListToClipboard = async () => {
        const decklistString = Object.keys(deckCards).reduce(
            (decklist, cardName) => `${decklist}${decklist === '' ? '' : '\n'}${deckCards[cardName]} ${cardName}`
            , '')
        await navigator.clipboard.writeText(decklistString)
    }

    const save = async () => {
        await setDataToDatabase('decks', 'first', {
            name: deckName,
            cards: deckCards
        })
    }

    const load = async () => {
        const deckData = await getDataFromDatabase('decks', 'first') as Deck
        if (!deckData) {
            return
        }
        setDeckCards(deckData.cards)
    }

    const confirmDeckCreation = () => {
        // createDeck(deckName)
        hideDeckCreation()
    }

    const hideDeckCreation = () => {
        hideDeckCreationPopup()
        setDeckName('')
    }

    const addFromQuickSearch = (cardData: CardData) => {
        // setCardImages(prevImages => [...prevImages, cardData['image_uris'].normal])
        // setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
        // setDeckCardData(prev => ({ ...prev, [cardData.name]: cardData }))
        setCardSearchTerm('')
    }

    const onChangeCardCount = (cardData: CardData, quantity: number) => {
        // setCardImages(prevImages => [...prevImages, cardData['image_uris'].normal])
        if (quantity > 0) {
            setDeckCards(prev => ({ ...prev, [cardData.name]: quantity }))
            // if (!cardDictionary[cardData.name]) {
            //     setDeckCardData(prev => ({ ...prev, [cardData.name]: cardData }))
            // }
        } else {
            if (deckCards[cardData.name]) {
                const newDeckCards = { ...deckCards }
                delete newDeckCards[cardData.name]
                setDeckCards(newDeckCards)
            }

            if (cardDictionary[cardData.name]) {
                const newDeckCardData = { ...cardDictionary }
                delete newDeckCardData[cardData.name]
                // setDeckCardData(newDeckCardData)
            }
        }
    }

    const dropCardFromOutside = async (e: React.DragEvent<HTMLDivElement>) => {
        setCardSearchTerm('')
        e.preventDefault()

        console.log(e)

        if (e.dataTransfer.files.length === 0) {
            return
        }

        const fileName = e.dataTransfer.files[0].name
        const scryfallMatch = fileName.match(/(?<=.+-.+-).+(?=\.jpg)/)
        const marketPlaceMatch = fileName.match(/^\d+(?=\.jpg)/)

        console.log('here', fileName)

        if (scryfallMatch) {
            // scryfall match
            const cardName = scryfallMatch[0]
            console.log('what is that', cardName)

            const params = new URLSearchParams([['fuzzy', cardName]]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/named?${params}`)
            const result = await requestResult.json()
            console.log(result)

            const cardData = result

            if (cardData.status) {
                return
            }

            // setCardImages(prevImages => [...prevImages, cardData['image_uris'].normal])
            setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
            // setDeckCardData(prev => ({ ...prev, [cardData.name]: cardData }))
        }

        if (marketPlaceMatch) {
            // scryfall match
            const cardName = marketPlaceMatch[0]
            console.log('what is this', cardName)

            const cardMarketRequestResult = await fetch(`https://api.scryfall.com/cards/cardmarket/${cardName}`)
            const cardMarketResult = await cardMarketRequestResult.json()
            console.log(cardMarketResult)
            const cardMarketCardData = cardMarketResult
            if (!cardMarketCardData.status) {
                // setCardImages(prevImages => [...prevImages, cardMarketCardData['image_uris'].normal])
                setDeckCards(prev => ({ ...prev, [cardMarketCardData.name]: (deckCards[cardMarketCardData.name] ?? 0) + 1 }))
                // setDeckCardData(prev => ({ ...prev, [cardMarketCardData.name]: cardMarketCardData }))
                return
            }

            const tcgPlayerRequestResult = await fetch(`https://api.scryfall.com/cards/tcgplayer/${cardName}`)
            const tcgPlayerResult = await tcgPlayerRequestResult.json()
            console.log(tcgPlayerResult)
            const tcgPlayerCardData = tcgPlayerResult
            if (!tcgPlayerCardData.status) {
                // setCardImages(prevImages => [...prevImages, tcgPlayerCardData['image_uris'].normal])
                setDeckCards(prev => ({ ...prev, [tcgPlayerCardData.name]: (deckCards[tcgPlayerCardData.name] ?? 0) + 1 }))
                // setDeckCardData(prev => ({ ...prev, [tcgPlayerCardData.name]: tcgPlayerCardData }))
                return
            }
        }
    }

    return (
        <div className='layout'>
            <AuthenticationForm />
            <div className='top-bar'>
                <button onClick={showDeckCreationPopup}>+ New Deck</button>
                <button onClick={getRandomCard}>Random card</button>
                <button className='right-placed-item' onClick={copyDeckListToClipboard}>Copy deck list</button>
                <button className='right-placed-item' onClick={save}>Save</button>
                <button onClick={load}>Load</button>
                {/* <button onClick={getBulkData}>Get bulk data</button> */}
            </div>

            {deckCreationPopupVisible && <div>
                <div className='labelled-input'>
                    <label htmlFor="name">Name (4 to 8 characters):</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        size={10}
                        value={deckName}
                        onChange={e => setDeckName(e.target.value)}
                    />
                </div>
                <button onClick={hideDeckCreation}>Cancel</button>
                <button onClick={confirmDeckCreation}>Confirm</button>
            </div>}

            <div className='card-search'>
                <div className='stat-row'>
                    <div className='flex-row'>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            size={10}
                            value={cardSearchTerm}
                            onChange={onChangeSearchTerm}
                        />
                        <button onClick={showSearchWindow}>Full search</button>
                    </div>
                    <div className='flex-row flex-gap'>
                        <div>{Object.keys(deckStats.legalities).map(format => <div>{format}</div>)}</div>
                        <div>{deckStats.numberOfCards}</div>
                        <div>€{deckStats.price.toFixed(2)}</div>
                    </div>
                </div>
                {cardSearchResults.slice(0, 5).map(cardData => <button key={cardData.name} className='card-search-result' onClick={() => addFromQuickSearch(cardData)}>
                    <img src={getCardImages(cardData)?.art_crop} className='card-search-result-image' /><p>{cardData.name}</p>
                </button>)}
            </div>
            {/* 
            <div>
                {Object.entries(decks).map(([id, deck]) =>
                    <div className='deck-preview'>{deck.name}</div>
                )}
            </div> */}

            {searchWindowVisible && <SearchWindow searchTerm={cardSearchTerm} onChangeSearchTerm={setCardSearchTerm} back={hideSearchWindowAndCleanup} onChangeCardCount={onChangeCardCount} deckCards={deckCards} />}

            <div className='deck'
                onDrop={dropCardFromOutside}
                onDragOver={e => {
                    e.preventDefault()
                }}
            >
                {Object.keys(deckCards).map(cardName => <div
                    // className={`deck-card ${currentCard === cardName ? 'drag-card' : ''}`}
                    className={`deck-card`}
                    // style={currentCard === cardName ? { left: currentCardPosition[0] - currentCardOffset[0], top: currentCardPosition[1] - currentCardOffset[1] } : {}} 
                    key={cardName}
                // onMouseDown={(e) => {
                //     const rect = e.currentTarget.getBoundingClientRect()
                //     const x = e.clientX - rect.left
                //     const y = e.clientY - rect.top
                //     // console.log(e.currentTarget.getBoundingClientRect())
                //     setCurrentCardOffset([x, y])
                //     console.log(x, y)
                //     setCurrentCard(cardName)
                // }}
                // onMouseUp={(() => setCurrentCard(''))}
                // onDrag={(e) => {
                //     // console.log(e.screenX)
                //     setCurrentCardPosition([e.screenX, e.screenY])
                // }}
                >
                    <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' />
                    <div className='card-count-container flex-column'>
                        <div className='card-count'>x{deckCards[cardName]}</div>
                        <div className='flex-row'>
                            <button className='flex-button' onClick={() => onChangeCardCount(cardDictionary[cardName], (deckCards[cardName] ?? 0) - 1)}>-</button>
                            <button className='flex-button' onClick={() => onChangeCardCount(cardDictionary[cardName], (deckCards[cardName] ?? 0) + 1)}>+</button>
                        </div>
                    </div>
                </div>)}
            </div>

            {/* <div className='bottom-bar'>€{totalPrice.toFixed(2)}</div> */}
        </div>
    )
}
