import { useContext, useState } from 'react'
import React from 'react'
import { AppContext } from '../context/AppContext'
import { useBooleanState } from '../hooks/useBooleanState'
import { CardData, Deck, GroupBy, ViewType } from '../types'
import { getCardImages } from '../utilities/card'
import { AuthContext } from '../context/AuthContext'
import { getDataFromDatabase, setDataToDatabase } from '../api/common/database'
import { SearchWindow } from './SearchWindow'
import { DeckPageTopBar } from './DeckPage/DeckPageTopBar'

const basicLandRegex = /Basic Land/

export const DeckPage = () => {
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
    const [groupBy, setGroupBy] = React.useState<GroupBy>('mana-value')
    const [viewType, setViewType] = React.useState<ViewType>('grid')
    const [topBarPinned, setTopBarPinned] = React.useState(false)
    const [cardSearchTerm, setCardSearchTerm] = React.useState('')
    const [cardSearchResults, setCardSearchResults] = React.useState<CardData[]>([])

    const [searchWindowVisible, showSearchWindow, hideSearchWindow] = useBooleanState()

    const hideSearchWindowAndCleanup = () => {
        hideSearchWindow()
    }

    React.useEffect(() => {
        if (!searchWindowVisible) {
            setCardSearchTerm('')
        }
    }, [searchWindowVisible])

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

    const getRandomCard = async () => {
        try {
            const params = new URLSearchParams([['q', 'niv mizzet']]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/random?${params}`)
            const result = await requestResult.json()
            if (result.object === 'error') {
                return
            }
            const cardData = result
            setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
        }
        catch {
            console.log('error: no random card')
        }
    }

    const searchCard = async () => {
        try {
            const params = new URLSearchParams([['q', cardSearchTerm]]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/search?${params}`)
            const result = await requestResult.json()
            const cards: CardData[] = result.data
            const data = cards.filter(cardData => !cardData.digital)
            console.log(data)
            setCardSearchResults(data)
        }
        catch (err) {
            console.log('error: no results')
        }
    }

    // const onChangeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setCardSearchTerm(e.target.value)
    // }

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
        setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
        setCardSearchTerm('')
    }

    const onChangeCardCount = (cardData: CardData, quantity: number) => {
        if (quantity > 0) {
            setDeckCards(prev => ({ ...prev, [cardData.name]: quantity }))
        } else if (deckCards[cardData.name]) {
            const newDeckCards = { ...deckCards }
            delete newDeckCards[cardData.name]
            setDeckCards(newDeckCards)
        }
    }

    const dropCardFromOutside = async (e: React.DragEvent<HTMLDivElement>) => {
        setCardSearchTerm('')
        e.preventDefault()

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

            const params = new URLSearchParams([['fuzzy', cardName]]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/named?${params}`)
            const result = await requestResult.json()

            const cardData = result

            if (cardData.status) {
                return
            }

            setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
        }

        if (marketPlaceMatch) {
            // cardmarket or tcgplayer match
            const cardName = marketPlaceMatch[0]

            const cardMarketRequestResult = await fetch(`https://api.scryfall.com/cards/cardmarket/${cardName}`)
            const cardMarketResult = await cardMarketRequestResult.json()
            const cardMarketCardData = cardMarketResult
            if (!cardMarketCardData.status) {
                setDeckCards(prev => ({ ...prev, [cardMarketCardData.name]: (deckCards[cardMarketCardData.name] ?? 0) + 1 }))
                return
            }

            const tcgPlayerRequestResult = await fetch(`https://api.scryfall.com/cards/tcgplayer/${cardName}`)
            const tcgPlayerResult = await tcgPlayerRequestResult.json()
            const tcgPlayerCardData = tcgPlayerResult
            if (!tcgPlayerCardData.status) {
                setDeckCards(prev => ({ ...prev, [tcgPlayerCardData.name]: (deckCards[tcgPlayerCardData.name] ?? 0) + 1 }))
                return
            }
        }
    }

    return (
        <div className='layout'>
            <div className='top-bar'>
                <button onClick={showDeckCreationPopup}>+ New Deck</button>
                <button onClick={getRandomCard}>Random card</button>
                <button className='right-placed-item' onClick={copyDeckListToClipboard}>Copy deck list</button>
                <button className='right-placed-item' onClick={save}>Save</button>
                <button onClick={load}>Load</button>
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

            <DeckPageTopBar
                cardSearchTerm={cardSearchTerm}
                setCardSearchTerm={setCardSearchTerm}
                cardSearchResults={cardSearchResults}
                showSearchWindow={showSearchWindow}
                deckStats={deckStats}
                addFromQuickSearch={addFromQuickSearch}
                pinned={topBarPinned}
                setPinned={setTopBarPinned}
            />

            {searchWindowVisible && <SearchWindow back={hideSearchWindowAndCleanup} onChangeCardCount={onChangeCardCount} deckCards={deckCards} />}

            <div className='deck'
                onDrop={dropCardFromOutside}
                onDragOver={e => {
                    e.preventDefault()
                }}
            >
                {Object.keys(deckCards).map(cardName => <div className={`deck-card`} key={cardName}>
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
