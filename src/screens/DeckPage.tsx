import { useContext, useState } from 'react'
import React from 'react'
import { AppContext } from '../context/AppContext'
import { useBooleanState } from '../hooks/useBooleanState'
import { Board, CardArtData, CardData, CardGroupData, CategoryUpdateOperation, Color, CurrencyType, Deck, DeckCard, DeckMetaData, Format, GroupBy, GroupByColorMode, SortType, ViewType } from '../types'
import { getCardAllOracleText, getCardFrontImage } from '../utilities/card'
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
import { closestCenter, closestCorners, DndContext, DragEndEvent, PointerSensor, useDndContext, useDndMonitor, useSensor, useSensors } from '@dnd-kit/core'
import { CATEGORY_UPDATE_OPERATIONS, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME, NO_GROUP_NAME } from '../data/editor'
import { TextInput } from '../components/TextInput'
import { combineTextInputValidators, numbersLimitTextInputValidator, numbersOnlyTextInputValidator, omitFromArray, omitFromPartialRecord, omitFromRecord } from '../utilities/general'
import { CartArtWindow } from './CartArtWindow'
import { NUMBER_NAME_MAP } from '../data/general'
import { DeckMetaDataWindow } from './DeckMetaDataWindow'

const basicLandRegex = /Basic/

export const DeckPage = () => {
    // const [deckFormat, setDeckFormat] = React.useState<Format>('standard')
    const [deckName, setDeckName] = useState('')
    const [deckCreationPopupVisible, showDeckCreationPopup, hideDeckCreationPopup] = useBooleanState()

    // const { decks, createDeck } = useContext(AppContext)
    const { cardDictionary } = useContext(AppContext)

    const { user } = useContext(AuthContext)

    const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')

    const [deckMetaData, setDeckMetaData] = React.useState<DeckMetaData>({ name: 'Test deck', description: 'This is a description test', format: 'standard', visibility: 'private' })

    // const [categories, setCategories] = React.useState<Record<string, string[]>>({ uncategorised: [] })
    // const [currentCardPosition, setCurrentCardPosition] = React.useState([0, 0])
    // const [currentCardOffset, setCurrentCardOffset] = React.useState([0, 0])
    // const [currentCard, setCurrentCard] = React.useState('')
    // const [deckCards, setDeckCards] = React.useState<Record<string, DeckCard>>({})
    // const [deckCards, setDeckCards, updateDeckCard, deleteDeckCard] = useObjectRecordState<string, DeckCard>({})
    const {
        objectRecord: deckCards,
        setObjectRecord: setDeckCards,
        updateObjectProperty: updateDeckCard,
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
    const [quantityUpdateText, setQuantityUpdateText] = React.useState('')
    const [selectedCards, setSelectedCards] = React.useState<Record<string, Board>>({})

    const [searchWindowVisible, showSearchWindow, hideSearchWindow] = useBooleanState()
    const [cardArtWindowVisible, showCardArtWindow, hideCardArtWindow] = useBooleanState()
    const [deckMetaDataWindowVisible, showDeckMetaDataWindow, hideDeckMetaDataWindow] = useBooleanState()
    // console.log(deckCards)

    const mainboardRef = React.useRef<HTMLDivElement>(null)
    const sideboardRef = React.useRef<HTMLDivElement>(null)
    const consideringRef = React.useRef<HTMLDivElement>(null)

    const boardRefs = React.useMemo<Record<Board, React.RefObject<HTMLDivElement | null>>>(
        () => ({ mainboard: mainboardRef, sideboard: sideboardRef, considering: consideringRef }),
        [mainboardRef, sideboardRef, consideringRef])

    const dragSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

    const lastKnownScrollPosition = React.useRef(0)
    const userScrollRef = React.useRef(true)
    const userScrollRefTimeoutID = React.useRef<NodeJS.Timeout>(null)

    React.useEffect(() => {
        const onScroll = () => {
            if (userScrollRef.current) {
                lastKnownScrollPosition.current = window.scrollY;
            }

            if (userScrollRefTimeoutID.current) {
                clearTimeout(userScrollRefTimeoutID.current)
            }
            userScrollRefTimeoutID.current = setTimeout(() => userScrollRef.current = true, 30)
        }

        document.addEventListener('scroll', onScroll)

        return () => document.removeEventListener('scroll', onScroll)
    }, [])

    // React.useEffect(() => {
    //     const onScroll = (event: Event) => {
    //         // lastKnownScrollPosition.current = window.scrollY;
    //         // console.log('inp', event.data)
    //         console.log(Date.now() - timeref.current)
    //         timeref.current = Date.now()
    //     }

    //     document.addEventListener('input', onScroll)

    //     return () => document.removeEventListener('input', onScroll)
    // }, [])

    const mainboard = React.useMemo(() => {
        return Object.keys(deckCards).reduce<Record<string, number>>((board, cardName) => {
            if (deckCards[cardName].boards.mainboard) {
                board[cardName] = deckCards[cardName].boards.mainboard
            }
            return board
        }, {})
    }, [deckCards])


    const sideboard = React.useMemo(() => {
        return Object.keys(deckCards).reduce<Record<string, number>>((board, cardName) => {
            if (deckCards[cardName].boards.sideboard) {
                board[cardName] = deckCards[cardName].boards.sideboard
            }
            return board
        }, {})
    }, [deckCards])


    const considering = React.useMemo(() => {
        return Object.keys(deckCards).reduce<Record<string, number>>((board, cardName) => {
            if (deckCards[cardName].boards.considering) {
                board[cardName] = deckCards[cardName].boards.considering
            }
            return board
        }, {})
    }, [deckCards])

    const hideSearchWindowAndCleanup = () => {
        hideSearchWindow()
    }

    React.useEffect(() => {
        if (!searchWindowVisible) {
            setCardSearchTerm('')
        }
    }, [searchWindowVisible])

    const deckStats = React.useMemo(() => {
        let numberOfMainboardCards = 0
        let numberOfSideboardCards = 0
        let mainboardPrice = 0
        let sideboardPrice = 0
        const legalities: Record<string, boolean> = {}
        const legalityWarnings: Record<string, string> = {}

        Object.keys(deckCards).forEach((cardName) => {
            const mainboardCardQuantity = deckCards[cardName].boards.mainboard ?? 0
            numberOfMainboardCards += mainboardCardQuantity
            mainboardPrice += mainboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const sideboardCardQuantity = deckCards[cardName].boards.sideboard ?? 0
            numberOfMainboardCards += sideboardCardQuantity
            sideboardPrice += sideboardCardQuantity * parseFloat(cardDictionary[cardName].prices.eur ?? 0)

            const cardQuantity = mainboardCardQuantity + sideboardCardQuantity

            const isBasicLand = basicLandRegex.test(cardDictionary[cardName].type_line)
            const alternateQuantityMatch = getCardAllOracleText(cardDictionary[cardName]).match(/(?<=A deck can have up to )\w+/)
            const alternateQuantity = alternateQuantityMatch ? NUMBER_NAME_MAP[alternateQuantityMatch[0]] : undefined
            const infiniteQuantity = /A deck can have any number/.test(cardDictionary[cardName].oracle_text)

            Object.keys(cardDictionary[cardName].legalities).forEach(format => {
                if (legalities[format] === false) {
                    return
                }

                const legality = cardDictionary[cardName].legalities[format]
                if (legality === 'legal' && (
                    infiniteQuantity
                    || (alternateQuantity && cardQuantity <= alternateQuantity)
                    || (format === 'commander' && cardQuantity <= 1)
                    || cardQuantity <= 4
                    || isBasicLand
                )) {
                    legalities[format] = true
                }
                else if (legality === 'restricted' && cardQuantity <= 1) {
                    legalities[format] = true
                }
                else if (format === deckMetaData.format) {
                    legalities[format] = false
                    if (legality === 'not_legal') {
                        legalityWarnings[cardName] = `This card is not legal in ${deckMetaData.format}`
                    } else {
                        // Quantity higher than limit
                        legalityWarnings[cardName] = `The number of copies of this card goes over the limit for ${deckMetaData.format}`
                    }
                }
            })
        })

        const formats = Object.keys(legalities)
        formats.forEach((format) => {
            if (!legalities[format]) {
                delete legalities[format]
            }
        })

        return {
            mainboard: { numberOfCards: numberOfMainboardCards, price: mainboardPrice },
            sideboard: { numberOfCards: numberOfSideboardCards, price: sideboardPrice },
            legalities,
            legalityWarnings
        }
    }, [deckCards, cardDictionary, deckMetaData])

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

    const addDeckCardQuantity = React.useCallback((cardName: string, quantity: number, board: Board) => {
        const newQuantity = Math.max((deckCards[cardName]?.boards[board] ?? 0) + quantity, 0)

        if (newQuantity === 0) {
            if (Object.keys(deckCards[cardName].boards).length === 1) {
                deleteDeckCard(cardName)
            }

            updateDeckCard(cardName, 'boards', omitFromPartialRecord(deckCards[cardName].boards, board))
        }
        else {
            updateDeckCard(cardName, 'boards', { ...deckCards[cardName]?.boards, [board]: newQuantity })
        }
    }, [deckCards, updateDeckCard, deleteDeckCard])

    const moveCardBoard = (cardName: string, fromBoard: Board, toBoard: Board) => {
        const newCardBoards = { ...deckCards[cardName].boards }

        const quantity = newCardBoards[fromBoard]
        delete newCardBoards[fromBoard]
        newCardBoards[toBoard] = (newCardBoards[toBoard] ?? 0) + (quantity ?? 0)

        updateDeckCard(cardName, 'boards', newCardBoards)
    }

    const moveSelectedCardsToBoard = (board: Board) => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            const currentBoard = selectedCards[cardName]
            const quantity = newDeckCards[cardName].boards[currentBoard]
            delete newDeckCards[cardName].boards[currentBoard]
            newDeckCards[cardName].boards[board] = (newDeckCards[cardName].boards[board] ?? 0) + (quantity ?? 0)
        })

        setDeckCards(newDeckCards)
        setSelectedCards({})
    }

    const getRandomCard = async () => {
        try {
            const params = new URLSearchParams([['q', 'niv mizzet']]);
            const requestResult = await fetch(`https://api.scryfall.com/cards/random?${params}`)
            const result = await requestResult.json()
            if (result.object === 'error') {
                return
            }
            const cardData = result
            addDeckCardQuantity(cardData.name, 1, 'mainboard')
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
        addDeckCardQuantity(cardData.name, 1, 'mainboard')
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

    const dropCardFromOutside = async (e: React.DragEvent<HTMLDivElement>, board: Board) => {
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
            addDeckCardQuantity(cardData.name, 1, board)
        }

        if (marketPlaceMatch) {
            // cardmarket or tcgplayer match
            const cardName = marketPlaceMatch[0]

            const cardMarketRequestResult = await fetch(`https://api.scryfall.com/cards/cardmarket/${cardName}`)
            const cardMarketResult = await cardMarketRequestResult.json()
            const cardMarketCardData = cardMarketResult
            if (!cardMarketCardData.status) {
                // setDeckCards(prev => ({ ...prev, [cardMarketCardData.name]: (deckCards[cardMarketCardData.name] ?? 0) + 1 }))
                addDeckCardQuantity(cardMarketCardData.name, 1, board)
                return
            }

            const tcgPlayerRequestResult = await fetch(`https://api.scryfall.com/cards/tcgplayer/${cardName}`)
            const tcgPlayerResult = await tcgPlayerRequestResult.json()
            const tcgPlayerCardData = tcgPlayerResult
            if (!tcgPlayerCardData.status) {
                // setDeckCards(prev => ({ ...prev, [tcgPlayerCardData.name]: (deckCards[tcgPlayerCardData.name] ?? 0) + 1 }))
                addDeckCardQuantity(tcgPlayerCardData.name, 1, board)
                return
            }
        }
    }

    const selectCard = (cardName: string, board: Board) => {
        if (selectedCards[cardName] === board) {
            setSelectedCards((prevCards) => omitFromRecord(prevCards, cardName))
        }
        else {
            setSelectedCards((prevCards) => ({ ...prevCards, [cardName]: board }))
        }
    }

    // const getCardGroups = React.useCallback((board: Board) => {
    //     // if (groupBy === 'none') {
    //     //     return [{
    //     //         name: NO_GROUP_NAME,
    //     //         cards: Object.keys(deckCards)
    //     //     }]
    //     // }

    //     const boardCardMap = Object.keys(deckCards).reduce<Record<string, number>>((boardMap, cardName) => {
    //         if (deckCards[cardName].boards[board]) {
    //             boardMap[cardName] = deckCards[cardName].boards[board]
    //         }
    //         return boardMap
    //     }, {})

    //     let groups: CardGroupData[] = []

    //     const boardCards = Object.keys(boardCardMap)

    //     switch (groupBy) {
    //         case 'category':
    //             groups = groupCardsByCategory(deckCards, boardCards)
    //             break;
    //         case 'color':
    //             groups = groupCardsByColor(boardCards, cardDictionary, groupByColorMode)
    //             break;
    //         case 'mana-value':
    //             groups = groupCardsByManaValue(boardCards, cardDictionary)
    //             break;
    //         case 'sub-type':
    //             groups = groupCardsBySubType(boardCards, cardDictionary)
    //             break;
    //         case 'type':
    //             groups = groupCardsByType(boardCards, cardDictionary, groupByTypeLastCardTypeOnly)
    //             break;
    //         case 'none':
    //             groups = [{
    //                 name: NO_GROUP_NAME,
    //                 cards: Object.keys(boardCards)
    //             }]
    //             break;
    //     }

    //     groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], false)))

    //     return groups
    // }, [deckCards, cardDictionary, groupBy, groupByColorMode, groupByTypeLastCardTypeOnly, sortType]) 

    const mainboardCardGroups = React.useMemo(() => {
        if (groupBy === 'none') {
            return [{
                name: NO_GROUP_NAME,
                cards: Object.keys(deckCards)
            }]
        }

        let groups: CardGroupData[] = []

        const boardCards = Object.keys(mainboard)

        switch (groupBy) {
            case 'category':
                groups = groupCardsByCategory(deckCards, boardCards)
                break;
            case 'color':
                groups = groupCardsByColor(boardCards, cardDictionary, groupByColorMode)
                break;
            case 'mana-value':
                groups = groupCardsByManaValue(boardCards, cardDictionary)
                break;
            case 'sub-type':
                groups = groupCardsBySubType(boardCards, cardDictionary)
                break;
            case 'type':
                groups = groupCardsByType(boardCards, cardDictionary, groupByTypeLastCardTypeOnly)
                break;
        }

        groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], false)))

        return groups
    }, [deckCards, mainboard, cardDictionary, groupBy, groupByColorMode, groupByTypeLastCardTypeOnly, sortType])

    const sideboardCardGroups = React.useMemo(() => {
        if (groupBy === 'none') {
            return [{
                name: NO_GROUP_NAME,
                cards: Object.keys(deckCards)
            }]
        }

        let groups: CardGroupData[] = []

        const boardCards = Object.keys(sideboard)

        switch (groupBy) {
            case 'category':
                groups = groupCardsByCategory(deckCards, boardCards)
                break;
            case 'color':
                groups = groupCardsByColor(boardCards, cardDictionary, groupByColorMode)
                break;
            case 'mana-value':
                groups = groupCardsByManaValue(boardCards, cardDictionary)
                break;
            case 'sub-type':
                groups = groupCardsBySubType(boardCards, cardDictionary)
                break;
            case 'type':
                groups = groupCardsByType(boardCards, cardDictionary, groupByTypeLastCardTypeOnly)
                break;
        }

        groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], false)))

        return groups
    }, [deckCards, sideboard, cardDictionary, groupBy, groupByColorMode, groupByTypeLastCardTypeOnly, sortType])

    const consideringCardGroups = React.useMemo(() => {
        if (groupBy === 'none') {
            return [{
                name: NO_GROUP_NAME,
                cards: Object.keys(deckCards)
            }]
        }

        let groups: CardGroupData[] = []

        const boardCards = Object.keys(considering)

        switch (groupBy) {
            case 'category':
                groups = groupCardsByCategory(deckCards, boardCards)
                break;
            case 'color':
                groups = groupCardsByColor(boardCards, cardDictionary, groupByColorMode)
                break;
            case 'mana-value':
                groups = groupCardsByManaValue(boardCards, cardDictionary)
                break;
            case 'sub-type':
                groups = groupCardsBySubType(boardCards, cardDictionary)
                break;
            case 'type':
                groups = groupCardsByType(boardCards, cardDictionary, groupByTypeLastCardTypeOnly)
                break;
        }

        groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], false)))

        return groups
    }, [deckCards, considering, cardDictionary, groupBy, groupByColorMode, groupByTypeLastCardTypeOnly, sortType])

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

    const handleCardDragEnd = (event: DragEndEvent) => {
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

    const scrollToBoard = (board: Board) => {
        if (boardRefs[board].current) {
            boardRefs[board].current?.scrollIntoView({ behavior: 'smooth' })
        }
        userScrollRef.current = false
    }

    const scrollToLastKnownPosition = () => {
        window.scrollTo({ top: lastKnownScrollPosition.current, behavior: 'smooth' })
        userScrollRef.current = false
    }

    const updateSelectedCards = () => {
        const newDeckCards = { ...deckCards }

        const quantity = parseInt(quantityUpdateText)
        // const categories = categoryUpdateText.split(/ +/).filter(category => !!category)
        const category = categoryUpdateText.trim()

        Object.keys(selectedCards).forEach((cardName) => {
            if (Number.isInteger(quantity)) {
                newDeckCards[cardName].boards[selectedCards[cardName]] = parseInt(quantityUpdateText)
            }
            if (category) {
                if (!newDeckCards[cardName].categories) {
                    newDeckCards[cardName].categories = []
                }
                // if (categoryUpdateOperation === 'add') {
                const uniqueCategories = new Set([...newDeckCards[cardName].categories, category])
                newDeckCards[cardName].categories = Array.from(uniqueCategories)
                // }
                // else {
                //     newDeckCards[cardName].categories = categories
                // }
            }
        })

        setDeckCards(newDeckCards)
        setCategoryUpdateText('')
        setQuantityUpdateText('')
        setSelectedCards({})
    }

    const removeSelectedCards = () => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            delete newDeckCards[cardName]
        })

        setDeckCards(newDeckCards)
        setSelectedCards({})
    }

    const removeSelectedCardsCategories = () => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            newDeckCards[cardName].categories = undefined
        })

        setDeckCards(newDeckCards)
    }

    const deselectAllCards = () => {
        setSelectedCards({})
    }

    // const boardGroups = React.useMemo(() => {
    //     return [{ name: 'Mainboard', groups: mainboardCardGroups },
    //     { name: 'Sideboard', groups: sideboardCardGroups },
    //     { name: 'Considering', groups: consideringCardGroups }
    //     ]
    // }, [mainboardCardGroups, sideboardCardGroups, consideringCardGroups])

    // useDndMonitor({ onDragStart: () => console.log('start'), onDragEnd: () => console.log('end') })

    const saveArtChanges = (cardArtMap: Record<string, CardArtData>) => {
        const newDeckCards = { ...deckCards }

        Object.keys(cardArtMap).forEach((cardName) => {
            if (newDeckCards[cardName].print?.set === cardArtMap[cardName].set) {
                return
            }

            // newDeckCards[cardName].print = {
            //     set: cardArtMap[cardName].set,
            //     uris: cardArtMap[cardName].image_uris.map(image => image.normal)
            // }
            newDeckCards[cardName] = {
                ...newDeckCards[cardName],
                print: {
                    set: cardArtMap[cardName].set,
                    uris: cardArtMap[cardName].image_uris.map(image => image.normal)
                }
            }
        })

        setDeckCards(newDeckCards)
        setCategoryUpdateText('')
        setQuantityUpdateText('')
        setSelectedCards({})
    }

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
                showDeckMetaDataWindow={showDeckMetaDataWindow}
                // deckStats={deckStats}
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
            {cardArtWindowVisible && <CartArtWindow back={hideCardArtWindow} save={saveArtChanges} selectedCards={selectedCards} deckCards={deckCards} />}
            {deckMetaDataWindowVisible && <DeckMetaDataWindow back={hideDeckMetaDataWindow} save={setDeckMetaData} deckMetaData={deckMetaData} legalityWarnings={deckStats.legalityWarnings} />}

            <DndContext sensors={dragSensors} onDragEnd={handleCardDragEnd}>
                <div className='deck'>
                    {/* <BoardButton board={'sideboard'} scrollToBoard={scrollToBoard} /> */}
                    {mainboardCardGroups.length > 0 && <div ref={mainboardRef} className='flex-column' onDrop={(e) => dropCardFromOutside(e, 'mainboard')} onDragOver={e => e.preventDefault()}>
                        {mainboardCardGroups.map(group =>
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
                                board={'mainboard'}
                                legalityWarnings={deckStats.legalityWarnings}
                            />
                        )}
                    </div>}

                    {sideboardCardGroups.length > 0 && <div ref={sideboardRef} className='flex-column' onDrop={(e) => dropCardFromOutside(e, 'sideboard')} onDragOver={e => e.preventDefault()}>
                        Sideboard
                        {sideboardCardGroups.map(group =>
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
                                board={'sideboard'}
                                legalityWarnings={deckStats.legalityWarnings}
                            />
                        )}
                    </div>}

                    {consideringCardGroups.length > 0 && <div ref={consideringRef} className='flex-column' onDrop={(e) => dropCardFromOutside(e, 'considering')} onDragOver={e => e.preventDefault()}>
                        Considering
                        {consideringCardGroups.map(group =>
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
                                board={'considering'}
                                legalityWarnings={deckStats.legalityWarnings}
                            />
                        )}
                    </div>}

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
                {/* <Dropdown label={'Operation'} options={CATEGORY_UPDATE_OPERATIONS} value={categoryUpdateOperation} onSelect={setCategoryUpdateOperation} /> */}
                <TextInput label={'Add category'} value={categoryUpdateText} onChangeText={setCategoryUpdateText} />
                <TextInput label={'Quantity'} value={quantityUpdateText} onChangeText={setQuantityUpdateText} validator={combineTextInputValidators(numbersOnlyTextInputValidator, numbersLimitTextInputValidator(99))} />
                <button onClick={updateSelectedCards}>Update cards</button>
                <button onClick={removeSelectedCardsCategories}>Remove categories</button>
                <button onClick={removeSelectedCards}>Remove cards</button>
                {/* <div className='flex-column'> */}
                <button onClick={showCardArtWindow}>Change card art</button>
                <button onClick={() => moveSelectedCardsToBoard('mainboard')}>Move to mainboard</button>
                <button onClick={() => moveSelectedCardsToBoard('sideboard')}>Move to sideboard</button>
                <button onClick={() => moveSelectedCardsToBoard('considering')}>Move to considering</button>
                {/* </div> */}
                <button onClick={deselectAllCards}>Deselect cards</button>
            </div>}

            {/* <div style={{ position: 'sticky', bottom: 0, right: 0 }}> */}
            <div style={{ position: 'fixed', gap: '0.25em', bottom: '1%', right: '1%', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => scrollToBoard('mainboard')}>Go to mainboard</button>
                <button onClick={() => scrollToBoard('sideboard')}>Go to sideboard</button>
                {/* <BoardButton board={'sideboard'} scrollToBoard={scrollToBoard} /> */}
                <button onClick={() => scrollToBoard('considering')}>Go to considering</button>
                <button onClick={scrollToLastKnownPosition}>Scroll back</button>
            </div>
            {/* </div> */}

            {/* <div className='bottom-bar'>€{totalPrice.toFixed(2)}</div> */}
        </div>
    )
}
