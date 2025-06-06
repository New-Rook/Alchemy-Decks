import { useContext } from 'react'
import React from 'react'
import { AppContext } from '../../context/AppContext'
import { useBooleanState } from '../../hooks/useBooleanState'
import { Board, CardData, CardGroupData, Color, CurrencyType, DeckCard, DeckMetaData, GroupBy, GroupByColorMode, GroupByTypeMode, SortType, ViewType } from '../../types'
import { getCardAllCardName, getCardDroppedFromOutside } from '../../utilities/card'
import { SearchWindow } from '../SearchWindow'
import { DeckPageTopBar } from './DeckPageTopBar'
import { useObjectRecordState } from '../../hooks/useObjectRecordState'
import { CardGroup } from './CardGroup'
import { groupCardsByCategory, groupCardsByColor, groupCardsByManaValue, groupCardsBySubType, groupCardsByType } from '../../utilities/groupers'
import { Dropdown } from '../../components/Dropdown'
import { COLOR_COMBINATION_ORDER_PRIORITY, COLOR_DATA, COLOR_ORDER_PRIORITY, COLORLESS_DATA, GROUP_BY_COLOR_MODES, GROUP_BY_TYPE_MODES, GROUP_TYPES, searchRegex, SORT_TYPES } from '../../data/search'
import { TEST_DECK_CARDS } from '../../data/dev'
import { Checkbox } from '../../components/Checkbox'
import { CARD_SORTERS } from '../../utilities/sorters'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { COMMANDER_BACKGROUND_REGEX, COMMANDER_CHOOSE_A_BACKGROUND_REGEX, COMMANDER_DOCTORS_COMPANION_REGEX, COMMANDER_FRIENDS_FOREVER_REGEX, COMMANDER_GROUP_NAME, COMMANDER_PARTNER_REGEX, COMMANDER_PARTNER_WITH_REGEX, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, MULTI_COMMANDER_GROUP_NAME, NO_CATEGORY_NAME, NO_GROUP_NAME } from '../../data/editor'
import { omitFromPartialRecord, omitFromRecord, removeFromArray, splitArray, stringStartsAndEndsWith, typedKeys } from '../../utilities/general'
import { DeckMetaDataWindow } from './DeckMetaDataWindow'
import { useDeckScroll } from './useDeckScroll'
import { FloatingScrollMenu } from './FloatingScrollMenu'
import { MultiSelectBar } from './MultiSelectBar'
import { useDeckStats } from './useDeckStats'
import { useCommanders } from './useCommanders'
import { CommanderCardGroup } from './CommanderCardGroup'
import { DeckMetaDataDisplay } from './DeckMetaDataDisplay'

export const DeckPage = () => {
    const { cardDictionary, availableSortTypes } = useContext(AppContext)

    const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')
    const [deckMetaData, setDeckMetaData] = React.useState<DeckMetaData>({ name: 'Riku of two reflections, big spells and big ramp)', description: 'This is a description test', format: 'standard', visibility: 'private' })

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
    const [deckMetaDataWindowVisible, showDeckMetaDataWindow, hideDeckMetaDataWindow] = useBooleanState()
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
            addDeckCardQuantity(cardData.name, 1, board)
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

    const boards = React.useMemo<Record<Board, { name: string, groups: CardGroupData[] }>>(
        () => ({
            mainboard: { name: '', groups: mainboardCardGroups },
            sideboard: { name: 'Sideboard', groups: sideboardCardGroups },
            considering: { name: 'Considering', groups: consideringCardGroups }
        }),
        [mainboardCardGroups, sideboardCardGroups, consideringCardGroups])

    const getGroupLabel = React.useCallback((group: CardGroupData) => {
        if (groupBy === 'color') {
            const colorCombination = group.name
            if (COLOR_ORDER_PRIORITY[colorCombination as Color]) {
                return <img className='card-group-icon-title transparent-background' src={COLOR_DATA[colorCombination as Color].svg_uri} />
            }

            if (COLOR_COMBINATION_ORDER_PRIORITY[group.name]) {
                return <div>
                    {colorCombination.split('').map(color => <img key={color} className='card-group-icon-title transparent-background' src={COLOR_DATA[color as Color].svg_uri} />)}
                </div>
            }

            if (group.name === COLORLESS_DATA.key) {
                return <img className='card-group-icon-title transparent-background' src={COLORLESS_DATA.svg_uri} />
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

    const selectCard = (cardName: string, board: Board) => {
        if (selectedCards[cardName] === board) {
            setSelectedCards((prevCards) => omitFromRecord(prevCards, cardName))
        }
        else {
            setSelectedCards((prevCards) => ({ ...prevCards, [cardName]: board }))
        }
    }

    return (
        <div className='layout'>
            <DeckMetaDataDisplay
                showDeckMetaDataWindow={showDeckMetaDataWindow}
                deckMetaData={deckMetaData}
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
            <div className='flex-row flex-gap flex-end flex-wrap'>
                <Dropdown label={'Group by'} options={GROUP_TYPES} value={groupBy} onSelect={setGroupBy} />
                {groupBy === 'color' && <Dropdown label={'Group mode'} options={GROUP_BY_COLOR_MODES} value={groupByColorMode} onSelect={setGroupByColorMode} size={'large'} />}
                {groupBy === 'type' && <Dropdown label={'Group mode'} options={GROUP_BY_TYPE_MODES} value={groupByTypeMode} onSelect={setGroupByTypeMode} />}
                <Dropdown label={'Sort by'} options={availableSortTypes} value={sortType} onSelect={setSortType} />
            </div>
            {deckMetaData.format === 'commander' && <Checkbox label={`Include ${commanders.length === 1 ? COMMANDER_GROUP_NAME : MULTI_COMMANDER_GROUP_NAME} in other groups`} checked={includeCommandersInOtherGroups} onCheck={setIncludeCommandersInOtherGroups} />}

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
                />
            }

            {deckMetaDataWindowVisible && <DeckMetaDataWindow back={hideDeckMetaDataWindow} save={setDeckMetaData} deckMetaData={deckMetaData} legalityWarnings={deckStats.legalityWarnings} />}

            <DndContext sensors={dragSensors} onDragEnd={handleCardDragEnd}>
                <div className='deck'>
                    {typedKeys(boards).filter(board => boards[board].groups.length > 0).map(board =>
                        <div key={board} ref={boardRefs[board]} className='flex-column flex-gap' onDrop={(e) => handleCardDropFromOutside(e, board)} onDragOver={e => e.preventDefault()}>
                            {boards[board].name}
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
                                />
                            }
                            {boards[board].groups.map(group =>
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
                                    board={board}
                                    legalityWarnings={deckStats.legalityWarnings}
                                />
                            )}
                        </div>
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

            <FloatingScrollMenu boardActive={{
                mainboard: mainboardCardGroups.length > 0,
                sideboard: sideboardCardGroups.length > 0,
                considering: consideringCardGroups.length > 0
            }}
                scrollToBoard={scrollToBoard}
                scrollToLastKnownPosition={scrollToLastKnownPosition}
            />
        </div>
    )
}
