import { useContext, useState } from 'react'
import React from 'react'
import { AppContext } from '../context/AppContext'
import { useBooleanState } from '../hooks/useBooleanState'
import { CardData, CardGroupData, CategoryUpdateOperation, Color, CurrencyType, Deck, DeckCard, GroupBy, GroupByColorMode, SortType, ViewType } from '../types'
import { getCardImages } from '../utilities/card'
import { AuthContext } from '../context/AuthContext'
import { getDataFromDatabase, setDataToDatabase } from '../api/common/database'
import { SearchWindow } from './SearchWindow'
import { DeckPageTopBar } from './DeckPage/DeckPageTopBar'
import { useObjectRecordState } from '../hooks/useObjectRecordState'
import { CardGroup } from './DeckPage/CardGroup'
import { groupCardsByCategory, groupCardsByColor, groupCardsByManaValue, groupCardsBySubType, groupCardsByType, LAND_GROUP_NAME } from '../utilities/groupers'
import { Dropdown } from '../components/Dropdown'
import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_DATA, COLOR_ORDER_PRIORITY, COLORLESS_DATA, COLORLESS_ORDER_PRIORITY, GROUP_BY_COLOR_MODES, GROUP_TYPES, LAND_ORDER_PRIORITY, SORT_TYPES } from '../data/search'
import { TEST_DECK_CARDS } from '../data/dev'
import { Checkbox } from '../components/Checkbox'
import { CARD_SORTERS } from '../utilities/sorters'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CATEGORY_UPDATE_OPERATIONS, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from '../data/editor'
import { TextInput } from '../components/TextInput'
import { omitFromArray, omitFromRecord } from '../utilities/general'

const basicLandRegex = /Basic Land/

export const DeckPage = () => {
    const [deckName, setDeckName] = useState('')
    const [deckCreationPopupVisible, showDeckCreationPopup, hideDeckCreationPopup] = useBooleanState()

    // const { decks, createDeck } = useContext(AppContext)
    const { cardDictionary } = useContext(AppContext)

    const { user } = useContext(AuthContext)

    const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')

    const [categories, setCategories] = React.useState<Record<string, string[]>>({ uncategorised: [] })
    const [currentCardPosition, setCurrentCardPosition] = React.useState([0, 0])
    const [currentCardOffset, setCurrentCardOffset] = React.useState([0, 0])
    const [currentCard, setCurrentCard] = React.useState('')
    // const [deckCards, setDeckCards] = React.useState<Record<string, DeckCard>>({})
    // const [deckCards, setDeckCards, updateDeckCard, deleteDeckCard] = useObjectRecordState<string, DeckCard>({})
    const {
        objectRecord: deckCards,
        setObjectRecord: setDeckCards,
        updateObjectProperty: updateDeckCard,
        updateMultipleObjectsProperty: updateMultipleDeckCards,
        deleteObject: deleteDeckCard
    } = useObjectRecordState<string, DeckCard>(TEST_DECK_CARDS)
    const [groupBy, setGroupBy] = React.useState<GroupBy>('mana-value')
    const [groupByColorMode, setGroupByColorMode] = React.useState<GroupByColorMode>('multicolored-in-one')
    const [groupByTypeLastCardTypeOnly, setGroupByTypeLastCardTypeOnly] = React.useState(false)
    const [sortType, setSortType] = React.useState<SortType>('mana-value')
    const [viewType, setViewType] = React.useState<ViewType>('grid')
    const [topBarPinned, setTopBarPinned] = React.useState(false)
    const [cardSearchTerm, setCardSearchTerm] = React.useState('')
    const [cardSearchResults, setCardSearchResults] = React.useState<CardData[]>([])

    const [categoryUpdateOperation, setCategoryUpdateOperation] = React.useState<CategoryUpdateOperation>('overwrite')
    const [categoryUpdateText, setCategoryUpdateText] = React.useState('')
    const [selectedCards, setSelectedCards] = React.useState<Record<string, boolean>>({})

    const [searchWindowVisible, showSearchWindow, hideSearchWindow] = useBooleanState()
    // console.log(deckCards)

    const dragSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

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
            const cardQuantity = deckCards[cardName].quantity
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

    const availableSortTypes = React.useMemo(() => {
        return SORT_TYPES.filter(sort => {
            if (sort === 'price-eur') {
                return currencyType === 'eur'
            }

            if (sort === 'price-usd') {
                return currencyType === 'usd'
            }

            return true
        })
    }, [currencyType])

    const addDeckCardQuantity = React.useCallback((cardName: string, quantity: number) => {
        const newQuantity = Math.max((deckCards[cardName]?.quantity ?? 0) + quantity, 0)

        if (newQuantity === 0) {
            deleteDeckCard(cardName)
        }
        else {
            updateDeckCard(cardName, 'quantity', newQuantity)
        }
    }, [deckCards, updateDeckCard, deleteDeckCard])

    const getRandomCard = async () => {
        try {
            const params = new URLSearchParams([['q', 'niv mizzet']]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/random?${params}`)
            const result = await requestResult.json()
            if (result.object === 'error') {
                return
            }
            const cardData = result
            addDeckCardQuantity(cardData.name, 1)
            // setDeckCards(prev => ({
            //     ...prev, [cardData.name]:
            //     {
            //         ...deckCards[cardData.name],
            //         quantity: (deckCards[cardData.name].quantity ?? 0) + 1
            //     }
            // }))
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
        addDeckCardQuantity(cardData.name, 1)
        setCardSearchTerm('')
    }

    // const onChangeCardCount = (cardData: CardData, quantity: number) => {
    //     if (quantity > 0) {
    //         setDeckCards(prev => ({ ...prev, [cardData.name]: quantity }))
    //     } else if (deckCards[cardData.name]) {
    //         const newDeckCards = { ...deckCards }
    //         delete newDeckCards[cardData.name]
    //         setDeckCards(newDeckCards)
    //     }
    // }

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

            // setDeckCards(prev => ({ ...prev, [cardData.name]: (deckCards[cardData.name] ?? 0) + 1 }))
            addDeckCardQuantity(cardData.name, 1)
        }

        if (marketPlaceMatch) {
            // cardmarket or tcgplayer match
            const cardName = marketPlaceMatch[0]

            const cardMarketRequestResult = await fetch(`https://api.scryfall.com/cards/cardmarket/${cardName}`)
            const cardMarketResult = await cardMarketRequestResult.json()
            const cardMarketCardData = cardMarketResult
            if (!cardMarketCardData.status) {
                // setDeckCards(prev => ({ ...prev, [cardMarketCardData.name]: (deckCards[cardMarketCardData.name] ?? 0) + 1 }))
                addDeckCardQuantity(cardMarketCardData.name, 1)
                return
            }

            const tcgPlayerRequestResult = await fetch(`https://api.scryfall.com/cards/tcgplayer/${cardName}`)
            const tcgPlayerResult = await tcgPlayerRequestResult.json()
            const tcgPlayerCardData = tcgPlayerResult
            if (!tcgPlayerCardData.status) {
                // setDeckCards(prev => ({ ...prev, [tcgPlayerCardData.name]: (deckCards[tcgPlayerCardData.name] ?? 0) + 1 }))
                addDeckCardQuantity(tcgPlayerCardData.name, 1)
                return
            }
        }
    }

    const selectCard = (cardName: string) => {
        if (selectedCards[cardName]) {
            setSelectedCards((prevCards) => omitFromRecord(prevCards, cardName))
        }
        else {
            setSelectedCards((prevCards) => ({ ...prevCards, [cardName]: true }))
        }
    }

    const cardGroups = React.useMemo(() => {
        if (!groupBy) {
            return [{
                name: 'All cards',
                cards: Object.keys(deckCards)
            }]
        }

        let groups: CardGroupData[] = []

        // if (groupBy === 'category') {

        // const categoryGroups: Record<string, string[]> = {}
        // Object.keys(deckCards).forEach(cardName => {
        //     deckCards[cardName].categories.forEach(category => {
        //         if (!groups[category]) {
        //             groups[category] = []
        //         }
        //         groups[category].push(cardName)
        //     })
        // })
        // }

        switch (groupBy) {
            case 'category':
                groups = groupCardsByCategory(deckCards)
                break;
            case 'color':
                groups = groupCardsByColor(deckCards, cardDictionary, groupByColorMode)
                break;
            case 'mana-value':
                groups = groupCardsByManaValue(deckCards, cardDictionary)
                break;
            case 'sub-type':
                groups = groupCardsBySubType(deckCards, cardDictionary)
                break;
            case 'type':
                groups = groupCardsByType(deckCards, cardDictionary, groupByTypeLastCardTypeOnly)
                break;
        }

        groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], false)))

        return groups
    }, [deckCards, cardDictionary, groupBy, groupByColorMode, groupByTypeLastCardTypeOnly, sortType])

    const getGroupLabel = React.useCallback((group: CardGroupData) => {
        if (groupBy === 'color') {
            const colorCombination = group.name
            if (COLOR_ORDER_PRIORITY[colorCombination as Color]) {
                return <img className='search-symbol' src={COLOR_DATA[colorCombination as Color].svg_uri} />
            }

            if (COLOR_COMBINATION_ORDER_PRIORITY[group.name]) {
                return <div>
                    {colorCombination.split('').map(color => <img key={color} className='search-symbol' src={COLOR_DATA[color as Color].svg_uri} />)}
                </div>
            }

            if (group.name === COLORLESS_DATA.key) {
                return <img className='search-symbol' src={COLORLESS_DATA.svg_uri} />
            }
        }

        return group.name
    }, [groupBy])

    const handleCategoryDragEnd = (event: DragEndEvent) => {
        if (groupBy === 'category' && event.active.id && event.over?.id) {
            const cardDragIDSplit = event.active.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
            const cardName = cardDragIDSplit[0]
            const cardCurrentCategory = cardDragIDSplit[1]
            const categoryDropIDSplit = event.over.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
            const droppedCategoryName = categoryDropIDSplit[0]
            const droppedCategoryOperation = cardCurrentCategory === NO_CATEGORY_NAME ? DRAG_AND_DROP_OVERWRITE_OPERATION_NAME : categoryDropIDSplit[1]
            if (cardName && cardCurrentCategory !== droppedCategoryName) {
                console.log('category update', droppedCategoryOperation, [cardName, droppedCategoryName])
                if (droppedCategoryOperation === DRAG_AND_DROP_ADD_OPERATION_NAME && !deckCards[cardName].categories?.includes(droppedCategoryName)) {
                    updateDeckCard(cardName, 'categories', [...(deckCards[cardName].categories ?? []), droppedCategoryName])
                }
                else if (droppedCategoryOperation === DRAG_AND_DROP_OVERWRITE_OPERATION_NAME) {
                    updateDeckCard(cardName, 'categories', [droppedCategoryName])
                }
            }
            // console.log([event.active.id, event.over?.id])
        }
    }

    // const updateSelectedCardsCategories = () => {
    //     const deckCardUpdates = Object.keys(selectedCards).map<[string, 'categories', string[]]>(cardName => ([cardName, 'categories', []]))
    //     updateMultipleDeckCards(deckCardUpdates)
    // }

    return (
        <div className='layout'>
            {/* <div className='top-bar'>
                <button onClick={showDeckCreationPopup}>+ New Deck</button>
                <button onClick={getRandomCard}>Random card</button>
                <button className='right-placed-item' onClick={copyDeckListToClipboard}>Copy deck list</button>
                <button className='right-placed-item' onClick={save}>Save</button>
                <button onClick={load}>Load</button>
            </div> */}

            {/* {deckCreationPopupVisible && <div>
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
            </div>} */}

            <DeckPageTopBar
                cardSearchTerm={cardSearchTerm}
                setCardSearchTerm={setCardSearchTerm}
                cardSearchResults={cardSearchResults}
                showSearchWindow={showSearchWindow}
                deckStats={deckStats}
                deckCards={deckCards}
                addFromQuickSearch={addFromQuickSearch}
                pinned={topBarPinned}
                setPinned={setTopBarPinned}
            />

            <Dropdown label={'Group by'} options={GROUP_TYPES} value={groupBy} onSelect={setGroupBy} />
            {groupBy === 'color' && <Dropdown label={'Color group mode'} options={GROUP_BY_COLOR_MODES} value={groupByColorMode} onSelect={setGroupByColorMode} />}
            {groupBy === 'type' && <Checkbox label="Group only by last card type" checked={groupByTypeLastCardTypeOnly} onCheck={setGroupByTypeLastCardTypeOnly} />}
            <Dropdown label={'Sort by'} options={availableSortTypes} value={sortType} onSelect={setSortType} />

            {searchWindowVisible && <SearchWindow back={hideSearchWindowAndCleanup} addDeckCardQuantity={addDeckCardQuantity} deckCards={deckCards} />}

            <DndContext sensors={dragSensors} onDragEnd={handleCategoryDragEnd}>
                <div className='deck'
                    onDrop={dropCardFromOutside}
                    onDragOver={e => {
                        e.preventDefault()
                    }}
                >
                    {cardGroups.map(group =>
                        <CardGroup
                            key={group.name}
                            groupName={group.name}
                            groupLabel={getGroupLabel(group)}
                            cardNames={group.cards}
                            deckCards={deckCards}
                            addDeckCardQuantity={addDeckCardQuantity}
                            enableDragAndDrop={groupBy === 'category'}
                            selectedCards={selectedCards}
                            selectCard={selectCard}
                        />
                    )}

                    {/* {Object.keys(deckCards).map(cardName => <div className={`deck-card`} key={cardName}>
                    <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' />
                    <div className='card-count-container flex-column'>
                        <div className='card-count'>x{deckCards[cardName].quantity}</div>
                        <div className='flex-row'>
                            <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1)}>-</button>
                            <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1)}>+</button>
                        </div>
                    </div>
                </div>)} */}
                </div>
            </DndContext>

            {Object.keys(selectedCards).length > 0 && <div style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 2,
                backgroundColor: 'white',
                flexDirection: 'row',
                display: 'flex',
                gap: '2em',
                padding: '0.5em'
            }}>
                <Dropdown label={'Operation'} options={CATEGORY_UPDATE_OPERATIONS} value={categoryUpdateOperation} onSelect={setCategoryUpdateOperation} />
                <TextInput label={'Category'} value={categoryUpdateText} onChangeText={setCategoryUpdateText} />
            </div>}

            {/* <div className='bottom-bar'>€{totalPrice.toFixed(2)}</div> */}
        </div>
    )
}
