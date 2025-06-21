import { useContext } from 'react'
import React from 'react'
import { AppContext } from '../../context/AppContext'
import { useBooleanState } from '../../hooks/useBooleanState'
import { Board, BoardData, CardData, CardGroupData, Color, CurrencyType, DeckCard, DeckMetaData, GroupBy, GroupByColorMode, GroupByTypeMode, SortType, ViewType } from '../../types'
import { getCardAllCardName, getCardDroppedFromOutside } from '../../utilities/card'
import { SearchWindow } from '../SearchWindow'
import { DeckPageTopBar } from './DeckPageTopBar'
import { useObjectRecordState } from '../../hooks/useObjectRecordState'
import { CardGroup } from './CardGroup'
import { groupCardsByCategory, groupCardsByColor, groupCardsByManaValue, groupCardsBySubType, groupCardsByType } from '../../utilities/groupers'
import { Dropdown } from '../../components/Dropdown'
import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_COMBINATIONS_MAP, COLOR_DATA, COLOR_ORDER_PRIORITY, COLORLESS_DATA, GROUP_BY_COLOR_MODES, GROUP_BY_TYPE_MODES, GROUP_TYPES, searchRegex, VIEW_TYPES } from '../../data/search'
import { TEST_DECK_CARDS, TEST_DECK_METADATA } from '../../data/dev'
import { Checkbox } from '../../components/Checkbox'
import { CARD_SORTERS } from '../../utilities/sorters'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { BOARD_DATA, COMMANDER_GROUP_NAME, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, MANA_VALUE_SYMBOLS, MULTI_COMMANDER_GROUP_NAME, NO_CATEGORY_NAME, NO_GROUP_NAME } from '../../data/editor'
import { omitFromPartialRecord, omitFromRecord, removeFromArray, stringStartsAndEndsWith, toUniqueArray, typedKeys } from '../../utilities/general'
import { useDeckScroll } from './useDeckScroll'
import { FloatingScrollMenu } from './FloatingScrollMenu'
import { MultiSelectBar } from './MultiSelectBar'
import { useDeckStats } from './useDeckStats'
import { useCommanders } from './useCommanders'
import { CommanderCardGroup } from './CommanderCardGroup'
import { DeckMetaDataDisplay } from './DeckMetaDataDisplay'
import { DeckBoard } from './DeckBoard'

export const DeckPage = () => {
    const { cardDictionary, availableSortTypes } = useContext(AppContext)

    const [deckMetaData, setDeckMetaData] = React.useState<DeckMetaData>(TEST_DECK_METADATA)

    const {
        objectRecord: deckCards,
        setObjectRecord: setDeckCards,
        // updateObject: addDeckCard,
        updateObjectProperty: updateDeckCard,
        deleteObject: deleteDeckCard,
        deleteObjectProperty: deleteDeckCardProperty
    } = useObjectRecordState<string, DeckCard>(TEST_DECK_CARDS)

    const [groupBy, setGroupBy] = React.useState<GroupBy>('mana-value')
    const [groupByColorMode, setGroupByColorMode] = React.useState<GroupByColorMode>('multicolored-in-one')
    const [groupByTypeMode, setGroupByTypeMode] = React.useState<GroupByTypeMode>('all-types')
    const [sortType, setSortType] = React.useState<SortType>('mana-value')
    const [viewType, setViewType] = React.useState<ViewType>('grid')
    const [topBarPinned, setTopBarPinned] = React.useState(false)
    const [cardSearchTerm, setCardSearchTerm] = React.useState('')
    const [cardSearchResults, setCardSearchResults] = React.useState<CardData[]>([])
    const [sortAscending, setSortAscending] = React.useState(true)

    const [includeCommandersInOtherGroups, setIncludeCommandersInOtherGroups] = React.useState(false)

    const [selectedCards, setSelectedCards] = React.useState<Record<string, Board>>({})

    const [searchWindowVisible, showSearchWindow, hideSearchWindow] = useBooleanState()
    const [commanderPickWindowVisible, showCommanderPickWindow, hideCommanderPickWindow] = useBooleanState()
    const [commanderPickIndex, setCommanderPickIndex] = React.useState(0)

    const dragSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

    const {
        boardRefs,
        scrollToBoard,
        scrollToLastKnownPosition
    } = useDeckScroll()

    const getBoardCards = React.useCallback((board: Board) => {
        return Object.keys(deckCards).reduce<Record<string, number>>((boardCards, cardName) => {
            if (deckCards[cardName].boards[board]) {
                boardCards[cardName] = deckCards[cardName].boards[board]
            }
            return boardCards
        }, {})
    }, [deckCards])

    const mainboard = React.useMemo(() => getBoardCards('mainboard'), [getBoardCards])
    const sideboard = React.useMemo(() => getBoardCards('sideboard'), [getBoardCards])
    const considering = React.useMemo(() => getBoardCards('considering'), [getBoardCards])

    const commanders = React.useMemo(() => {
        return Object.keys(mainboard)
            .filter(cardName => !!deckCards[cardName].commanderNumber)
            .sort((cardName1, cardName2) => (deckCards[cardName1].commanderNumber ?? 0) - (deckCards[cardName2].commanderNumber ?? 0))
    }, [deckCards, mainboard])

    const {
        availableCommanders,
        setFirstCommander,
        setSecondCommander,
        removeSecondCommander
    } = useCommanders(deckMetaData.format, commanders, setDeckCards)

    const commanderColorIdentity = React.useMemo(() => {
        if (commanders.length === 0) {
            return null
        }

        const colorCombination = commanders.reduce((colorIdentity, commander) => {
            return colorIdentity += cardDictionary[commander].color_identity.join('')
        }, '')

        const uniqueColors = toUniqueArray(colorCombination.split('')).join('')

        return COLOR_COMBINATIONS_MAP[uniqueColors]
            ? COLOR_COMBINATIONS_MAP[uniqueColors]
            : uniqueColors
    }, [commanders])

    React.useEffect(() => {
        if (deckMetaData.format !== 'commander' && commanders.length > 0) {
            setDeckCards((prev) => {
                const newDeckCards = { ...prev }

                commanders.forEach(commander => {
                    delete newDeckCards[commander]
                })

                return newDeckCards
            })
        }
    }, [deckMetaData.format, commanders, setDeckCards])

    React.useEffect(() => {
        if (!searchWindowVisible) {
            setCardSearchTerm('')
        }
    }, [searchWindowVisible])

    const deckStats = useDeckStats({
        deckMetaData,
        deckCards,
        mainboard,
        sideboard,
        commanderColorIdentity,
        groupByColorMode,
        groupByTypeMode
    })

    const addDeckCardQuantity = React.useCallback((cardName: string, quantity: number, board: Board) => {
        const newQuantity = Math.max((deckCards[cardName]?.boards[board] ?? 0) + quantity, 0)

        if (newQuantity === 0) {
            if (Object.keys(deckCards[cardName].boards).length === 1) {
                deleteDeckCard(cardName)
                return
            }

            updateDeckCard(cardName, 'boards', omitFromPartialRecord(deckCards[cardName].boards, board))
        }
        else {
            updateDeckCard(cardName, 'boards', { ...deckCards[cardName]?.boards, [board]: newQuantity })
        }
    }, [deckCards, updateDeckCard, deleteDeckCard])

    const pickCommander = React.useCallback((cardName: string) => {
        if (commanderPickIndex === 0) {
            setFirstCommander(cardName)
        } else if (commanderPickIndex === 1) {
            setSecondCommander(cardName)
        }
    }, [setFirstCommander, setSecondCommander, commanderPickIndex])

    const openCommanderPickModal = (index: number) => {
        showCommanderPickWindow()
        setCommanderPickIndex(index)
    }

    // const moveCardBoard = (cardName: string, fromBoard: Board, toBoard: Board) => {
    //     const newCardBoards = { ...deckCards[cardName].boards }

    //     const quantity = newCardBoards[fromBoard]
    //     delete newCardBoards[fromBoard]
    //     newCardBoards[toBoard] = (newCardBoards[toBoard] ?? 0) + (quantity ?? 0)

    //     updateDeckCard(cardName, 'boards', newCardBoards)
    // }

    const legalCards = React.useMemo(() => {
        return Object.values(cardDictionary).filter(card => card.legalities[deckMetaData.format] !== 'not_legal')
    }, [cardDictionary, deckMetaData.format])

    const searchCard = async () => {
        // try {
        //     const params = new URLSearchParams([['q', cardSearchTerm]]);
        //     const requestResult = await fetch(`https://api.scryfall.com/cards/search?${params}`)
        //     const result = await requestResult.json()
        //     const cards: CardData[] = result.data
        //     const data = cards.filter(cardData => !cardData.digital)
        //     console.log(data)
        //     setCardSearchResults(data)
        // }
        // catch (err) {
        //     console.log('error: no results')
        // }

        const searchTerms = cardSearchTerm.match(searchRegex)

        if (!searchTerms) {
            return
        }

        const searchResults = legalCards.filter(card => {
            const cardNames = getCardAllCardName(card).toLocaleLowerCase()
            return searchTerms.every(text => {
                const regex = new RegExp(stringStartsAndEndsWith(text, '"') ? text.slice(1, -1).toLocaleLowerCase() : text.toLocaleLowerCase())
                return regex.test(cardNames)
            })
        })

        setCardSearchResults(searchResults)
    }

    React.useEffect(() => {
        if (searchWindowVisible) {
            setCardSearchTerm('')
            return
        }

        if (!cardSearchTerm) {
            setCardSearchResults([])
            return
        }

        const timeoutID = setTimeout(searchCard, 250)

        return () => clearTimeout(timeoutID)
    }, [searchWindowVisible, cardSearchTerm])

    const addFromQuickSearch = (cardData: CardData) => {
        addDeckCardQuantity(cardData.name, 1, 'mainboard')
        setCardSearchTerm('')
    }

    const handleCardDropFromOutside = async (e: React.DragEvent<HTMLDivElement>, board: Board) => {
        const cardData = await getCardDroppedFromOutside(e)

        if (cardData) {
            if (cardDictionary[cardData.name] &&
                (cardDictionary[cardData.name].legalities[deckMetaData.format] === 'legal'
                    || cardDictionary[cardData.name].legalities[deckMetaData.format] === 'restricted'
                )
            ) {
                addDeckCardQuantity(cardData.name, 1, board)
            } else {
                // Show message saying card not legal in format
            }
        }
    }

    const getCardGroups = React.useCallback((boardCardMap: Record<string, number>, excludeCommander = false) => {
        let groups: CardGroupData[] = []

        const boardCards = Object.keys(boardCardMap)

        if (excludeCommander) {
            removeFromArray(boardCards, ...commanders)
        }

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
                groups = groupCardsByType(boardCards, cardDictionary, groupByTypeMode)
                break;
            case 'none':
                groups = [{
                    name: NO_GROUP_NAME,
                    cards: Object.keys(boardCards)
                }]
                break;
        }

        groups.forEach(group => group.cards.sort((cardA, cardB) => CARD_SORTERS[sortType](cardDictionary[cardA], cardDictionary[cardB], !sortAscending)))

        return groups
    }, [deckCards, cardDictionary, groupBy, groupByColorMode, groupByTypeMode, sortType, sortAscending, commanders])

    const mainboardCardGroups = React.useMemo(() => getCardGroups(mainboard, !includeCommandersInOtherGroups), [getCardGroups, mainboard, includeCommandersInOtherGroups])
    const sideboardCardGroups = React.useMemo(() => getCardGroups(sideboard), [getCardGroups, sideboard])
    const consideringCardGroups = React.useMemo(() => getCardGroups(considering), [getCardGroups, considering])

    const boardGroups = React.useMemo<Record<Board, CardGroupData[]>>(
        () => ({
            mainboard: mainboardCardGroups,
            sideboard: sideboardCardGroups,
            considering: consideringCardGroups
        }),
        [mainboardCardGroups, sideboardCardGroups, consideringCardGroups])

    const getGroupColorLabel = React.useCallback((groupName: string) => {
        const colorCombination = groupName
        if (COLOR_ORDER_PRIORITY[colorCombination as Color]) {
            return <img className='card-group-icon-title transparent-background' src={COLOR_DATA[colorCombination as Color].svg_uri} />
        }

        if (COLOR_COMBINATION_ORDER_PRIORITY[groupName]) {
            return <div className='flex-row align-end'>
                {colorCombination.split('').map(color => <img key={color} className='card-group-icon-title transparent-background' src={COLOR_DATA[color as Color].svg_uri} />)}
            </div>
        }

        if (groupName === COLORLESS_DATA.key) {
            return <img className='card-group-icon-title transparent-background' src={COLORLESS_DATA.svg_uri} />
        }

        return groupName
    }, [])

    const getGroupLabel = React.useCallback((groupName: string) => {
        if (groupBy === 'color') {
            return getGroupColorLabel(groupName)
        }

        if (groupBy === 'mana-value' && MANA_VALUE_SYMBOLS[groupName]) {
            return <img className='card-group-icon-title transparent-background' src={MANA_VALUE_SYMBOLS[groupName].svg_uri} />
        }

        return groupName
    }, [groupBy, getGroupColorLabel])

    const commanderColorIdentityLabel = React.useMemo(() => {
        if (commanderColorIdentity === null) {
            return ''
        }

        return getGroupColorLabel(commanderColorIdentity)
    }, [commanderColorIdentity, getGroupColorLabel])

    const handleCardDragEnd = (event: DragEndEvent) => {
        if (groupBy === 'category' && event.active.id && event.over?.id) {
            const cardDragIDSplit = event.active.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
            const cardName = cardDragIDSplit[0]
            const cardCurrentCategory = cardDragIDSplit[1]
            const categoryDropIDSplit = event.over.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
            const droppedCategoryName = categoryDropIDSplit[0]
            const droppedCategoryOperation = categoryDropIDSplit[1]
            if (cardName && cardCurrentCategory !== droppedCategoryName) {
                console.log('category update', droppedCategoryOperation, [cardName, droppedCategoryName])
                if (droppedCategoryName === NO_CATEGORY_NAME) {
                    deleteDeckCardProperty(cardName, 'categories')
                }
                else if (droppedCategoryOperation === DRAG_AND_DROP_ADD_OPERATION_NAME && !deckCards[cardName].categories?.includes(droppedCategoryName)) {
                    updateDeckCard(cardName, 'categories', [...(deckCards[cardName].categories ?? []), droppedCategoryName])
                }
                else if (droppedCategoryOperation === DRAG_AND_DROP_OVERWRITE_OPERATION_NAME) {
                    updateDeckCard(cardName, 'categories', [droppedCategoryName])
                }
            }
            // console.log([event.active.id, event.over?.id])
        }
    }

    const selectCard = React.useCallback((cardName: string, board: Board) => {
        setSelectedCards((prevCards) => {
            if (prevCards[cardName] === board) {
                return omitFromRecord(prevCards, cardName)
            }
            return { ...prevCards, [cardName]: board }
        })
    }, [])

    return (
        <div className='layout'>
            <DeckMetaDataDisplay
                deckMetaData={deckMetaData}
                setDeckMetaData={setDeckMetaData}
                deckStats={deckStats}
                deckCards={deckCards}
            />
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
            <div className='flex-row flex-gap flex-end align-center flex-wrap base-offset-bottom deck-top-bar-elevated'>
                {deckMetaData.format === 'commander' && <Checkbox containerProps={{ className: 'flex-item-left' }} label={`Include ${commanders.length > 1 ? MULTI_COMMANDER_GROUP_NAME : COMMANDER_GROUP_NAME} in other groups`} checked={includeCommandersInOtherGroups} onCheck={setIncludeCommandersInOtherGroups} />}
                <Dropdown label={'View'} options={VIEW_TYPES} value={viewType} onSelect={setViewType} />
                <Dropdown label={'Group by'} options={GROUP_TYPES} value={groupBy} onSelect={setGroupBy} />
                {groupBy === 'color' && <Dropdown label={'Group mode'} options={GROUP_BY_COLOR_MODES} value={groupByColorMode} onSelect={setGroupByColorMode} size={'large'} />}
                {groupBy === 'type' && <Dropdown label={'Group mode'} options={GROUP_BY_TYPE_MODES} value={groupByTypeMode} onSelect={setGroupByTypeMode} />}
                <Dropdown label={'Sort by'} options={availableSortTypes} value={sortType} onSelect={setSortType} />
            </div>

            {(searchWindowVisible || commanderPickWindowVisible) &&
                <SearchWindow
                    back={commanderPickWindowVisible ? hideCommanderPickWindow : hideSearchWindow}
                    format={deckMetaData.format}
                    deckCards={deckCards}
                    addDeckCardQuantity={commanderPickWindowVisible ? pickCommander : addDeckCardQuantity}
                    availableCards={
                        commanderPickWindowVisible
                            ? commanderPickIndex === 0
                                ? availableCommanders.legalCommanders
                                : availableCommanders.partnerCommanders
                            : undefined
                    }
                    isCommanderPick={commanderPickWindowVisible}
                />
            }

            <DndContext sensors={dragSensors} onDragEnd={handleCardDragEnd}>
                <div className='deck'>
                    {typedKeys(boardGroups).filter(board => boardGroups[board].length > 0).map(board =>
                        <DeckBoard board={board} defaultExpanded={true} titleChildren={BOARD_DATA[board].name} titleProps={{ className: 'button-no-hover' }}>
                            <div key={board} ref={boardRefs[board]} className={boardStyleMap[viewType]} onDrop={(e) => handleCardDropFromOutside(e, board)} onDragOver={e => e.preventDefault()}>
                                {board === 'mainboard' && deckMetaData.format === 'commander' &&
                                    <CommanderCardGroup
                                        commanders={commanders}
                                        deckCards={deckCards}
                                        addDeckCardQuantity={addDeckCardQuantity}
                                        enableDragAndDrop={groupBy === 'category'}
                                        selectedCards={selectedCards}
                                        selectCard={selectCard}
                                        board={board}
                                        legalityWarnings={deckStats.legalityWarnings}
                                        openCommanderPickModal={openCommanderPickModal}
                                        secondCommanderPickAvailable={!!availableCommanders.partnerCommanders}
                                        removeSecondCommander={removeSecondCommander}
                                        viewType={viewType}
                                        colorIdentityLabel={commanderColorIdentityLabel}
                                    />
                                }
                                {boardGroups[board].map(group =>
                                    <CardGroup
                                        key={group.name}
                                        groupName={group.name}
                                        groupLabel={getGroupLabel(group.name)}
                                        cardNames={group.cards}
                                        deckCards={deckCards}
                                        addDeckCardQuantity={addDeckCardQuantity}
                                        enableDragAndDrop={groupBy === 'category'}
                                        selectedCards={selectedCards}
                                        selectCard={selectCard}
                                        board={board}
                                        legalityWarnings={deckStats.legalityWarnings}
                                        viewType={viewType}
                                        format={deckMetaData.format}
                                    />
                                )}
                            </div>
                        </DeckBoard>
                    )}
                </div>
            </DndContext>

            {/* <DeckStatsDisplay deckStats={deckStats} /> */}

            {Object.keys(selectedCards).length > 0 && <MultiSelectBar
                deckCards={deckCards}
                setDeckCards={setDeckCards}
                selectedCards={selectedCards}
                setSelectedCards={setSelectedCards}
            />}

            <FloatingScrollMenu boardGroups={boardGroups}
                scrollToBoard={scrollToBoard}
                scrollToLastKnownPosition={scrollToLastKnownPosition}
            />
        </div>
    )
}

const boardStyleMap: Record<ViewType, string> = {
    text: 'board-view-stacked',
    grid: 'board-view-grid',
    stacked: 'board-view-stacked',
    'grid-stacked': 'board-view-grid'
}