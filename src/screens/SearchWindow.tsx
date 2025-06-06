import { useContext } from 'react'
import React from 'react'
import { AppContext } from '../context/AppContext'
import { Board, CardData, CardTypeFilter, Color, ColorSearchType, DeckCards, Format, SearchFilterOperation, SearchTermFilter, SortType, StatFilter, StatFilterOperation, StatFilterStat } from '../types'
import { ALL_COLOR_KEYS, COLOR_DATA, COLOR_SEARCH_TYPES, COLORLESS_DATA, SEARCH_FILTER_OPERATION_DATA, searchRegex, STAT_FILTER_OPERATIONS, STAT_FILTER_STATS } from '../data/search'
import { getCardAllCardName, getCardAllOracleText, getCardColorsForSearch, getCardFrontImage } from '../utilities/card'
import { TextInput } from '../components/TextInput'
import { invertBoolean, numbersOnlyTextInputValidator, splitArray, stringLowerCaseIncludes, stringStartsAndEndsWith } from '../utilities/general'
import { useAdvancedState } from '../hooks/useAdvancedState'
import { CARD_SORTERS } from '../utilities/sorters'
import { Checkbox } from '../components/Checkbox'
import { Dropdown } from '../components/Dropdown'
import { checkCardTypeFilter, checkOracleTextSearchTermFilter, checkStatFilter, nextSearchFilterOperation, searchTermFilterToRegexes } from '../utilities/search'
import { TextInputWithSuggestions } from '../components/TextInputWithSuggestions'
import './SearchWindow.css'

type Props = {
    back: () => void
    format: Format
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
    availableCards?: string[]
}

const PAGINATION_LIMIT = 40

export const SearchWindow = ({ back, deckCards, addDeckCardQuantity, format, availableCards }: Props) => {
    const { cardDictionary, getCardPriceDisplay, availableSortTypes } = useContext(AppContext)

    const [searchWindowPageIndex, setSearchWindowPageIndex] = React.useState(0)

    const resetPageIndex = React.useCallback(() => {
        setSearchWindowPageIndex(0)
    }, [])

    // const [format, setFormat] = useAdvancedState<Format>('standard', resetPageIndex)
    const [sortType, setSortType] = useAdvancedState<SortType>('mana-value', resetPageIndex)
    const [sortAscending, setSortAscending] = useAdvancedState(true, resetPageIndex)
    // const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')
    const [colorFilters, setColorFilters] = useAdvancedState<Color[]>([], resetPageIndex)
    const [colorlessFilter, setColorlessFilter] = useAdvancedState(false, resetPageIndex)
    const [oracleTextSearchTermFilters, setOracleTextSearchTermFilters] = useAdvancedState<SearchTermFilter[]>([{ text: '', invert: false }], resetPageIndex)
    // const [oracleTextSearchTermOperation, setOracleTextSearchTermOperation] = useAdvancedState<SearchFilterOperation>('or', resetPageIndex)
    const [nameSearchTerm, setNameSearchTerm] = useAdvancedState('', resetPageIndex)
    const [showBannedCards, setShowBannedCards] = useAdvancedState(false, resetPageIndex)
    const [showPrices, setShowPrices] = React.useState(false)
    const [showNotes, setShowNotes] = React.useState(false)
    const [searchByColorIdentity, setSearchByColorIdentity] = useAdvancedState(false, resetPageIndex)
    const [colorSearchType, setColorSearchType] = useAdvancedState<ColorSearchType>('exact', resetPageIndex)
    const [cardTypeFilters, setCardTypeFilters] = useAdvancedState<CardTypeFilter[]>([{ cardType: '', invert: false }], resetPageIndex)
    const [cardTypeFilterOperation, setCardTypeFilterOperation] = useAdvancedState<SearchFilterOperation>('or', resetPageIndex)
    const [statFilters, setStatFilters] = useAdvancedState<StatFilter[]>([{ stat: 'mana-value', operation: 'equal', value: '' }], resetPageIndex)
    const [statFilterOperation, setStatFilterOperation] = useAdvancedState<SearchFilterOperation>('or', resetPageIndex)

    const [pendingNameSearchTerm, setPendingNameSearchTerm] = React.useState('')
    const [pendingOracleTextSearchTerm, setPendingOracleTextSearchTerm] = React.useState<SearchTermFilter[]>([{ text: '', invert: false }])

    // const getCardPriceDisplay = React.useCallback((cardData: CardData) => {
    //     if (currencyType === 'eur') {
    //         if (cardData.prices.eur !== '0.00') {
    //             return `€${cardData.prices.eur}`
    //         }
    //         if (cardData.prices.eur_foil !== '0.00') {
    //             return `€${cardData.prices.eur_foil}`
    //         }
    //     }
    //     else {
    //         if (cardData.prices.usd !== '0.00') {
    //             return `$${cardData.prices.usd}`
    //         }
    //         if (cardData.prices.usd_foil !== '0.00') {
    //             return `$${cardData.prices.usd_foil}`
    //         }
    //     }

    //     return '---'
    // }, [currencyType])

    React.useEffect(() => {
        if (!pendingNameSearchTerm) {
            setNameSearchTerm('')
            return
        }

        const timeoutID = setTimeout(() => setNameSearchTerm(pendingNameSearchTerm), 250)

        return () => clearTimeout(timeoutID)
    }, [pendingNameSearchTerm])

    React.useEffect(() => {
        // if (!pendingOracleTextSearchTerm) {
        //     setOracleTextSearchTerm([{ text: '', invert: false }])
        //     return
        // }

        const timeoutID = setTimeout(() => setOracleTextSearchTermFilters(pendingOracleTextSearchTerm), 250)

        return () => clearTimeout(timeoutID)
    }, [pendingOracleTextSearchTerm])

    // const availableSortTypes = React.useMemo(() => {
    //     return SORT_TYPES.filter(sort => {
    //         if (sort === 'price-eur') {
    //             return currencyType === 'eur'
    //         }

    //         if (sort === 'price-usd') {
    //             return currencyType === 'usd'
    //         }

    //         return true
    //     })
    // }, [currencyType])

    const toggleColorlessFilter = () => {
        if (!colorlessFilter) {
            setColorFilters([])
        }
        setColorlessFilter(!colorlessFilter)
    }

    const allCards = React.useMemo(() => {
        if (availableCards) {
            return availableCards.map(cardName => cardDictionary[cardName])
        }

        return Object.values(cardDictionary)
    }, [cardDictionary, availableCards])

    const legalCards = React.useMemo(() => {
        return allCards.filter(card => card.legalities[format] === 'legal' || card.legalities[format] === 'restricted' || (card.legalities[format] === 'banned' && showBannedCards))
    }, [format, showBannedCards])

    const searchTermNameFilteredCards = React.useMemo(() => {
        const searchTerms = nameSearchTerm.match(searchRegex)
        if (!searchTerms) {
            return legalCards
        }
        return legalCards.filter(card => {
            const cardNames = getCardAllCardName(card).toLocaleLowerCase()
            return searchTerms.every(text => {
                const regex = new RegExp(stringStartsAndEndsWith(text, '"') ? text.slice(1, -1).toLocaleLowerCase() : text.toLocaleLowerCase())
                return regex.test(cardNames)
            })
        })
    }, [legalCards, nameSearchTerm])

    const searchTermOracleTextFilteredCards = React.useMemo(() => {
        // if (oracleTextSearchTerm.length === 0) {
        //     return searchTermNameFilteredCards
        // }
        // if (oracleTextSearchTermFilters.every(filter => !filter.text)) {
        //     return searchTermNameFilteredCards
        // }

        const nonEmptyOracleTextSearchTermFilters =
            oracleTextSearchTermFilters.filter(filter => !!filter.text)

        if (nonEmptyOracleTextSearchTermFilters.length === 0) {
            return searchTermNameFilteredCards
        }

        const [positiveFilters, negativeFilters] = splitArray(nonEmptyOracleTextSearchTermFilters, (filter) => !filter.invert)

        const positiveRegexes = positiveFilters.map(searchTermFilterToRegexes)
        const negativeRegexes = negativeFilters.map(searchTermFilterToRegexes)

        return searchTermNameFilteredCards.filter(card => {
            return (positiveRegexes.length === 0 || positiveFilters.some((filter, index) => checkOracleTextSearchTermFilter(card, filter, positiveRegexes[index])))
                && negativeFilters.every((filter, index) => checkOracleTextSearchTermFilter(card, filter, negativeRegexes[index]))
        })
    }, [searchTermNameFilteredCards, oracleTextSearchTermFilters])

    const colorFilteredCards = React.useMemo(() => {
        if (colorFilters.length === 0 && !colorlessFilter) {
            return searchTermOracleTextFilteredCards
        }

        if (colorlessFilter && colorSearchType === 'at-least') {
            return searchTermOracleTextFilteredCards
        }

        return searchTermOracleTextFilteredCards.filter(card => {
            const cardColors = searchByColorIdentity ? card.color_identity : getCardColorsForSearch(card)
            if (colorlessFilter) {
                return cardColors.length === 0
            }

            if (colorSearchType === 'exact') {
                return cardColors.length === colorFilters.length
                    && colorFilters.every(color => cardColors.includes(color))
            }
            else if (colorSearchType === 'at-most') {
                return cardColors.every(color => colorFilters.includes(color))
            }
            else if (colorSearchType === 'at-least') {
                return colorFilters.every(color => cardColors.includes(color))
            }
            return true
        })
    }, [searchTermOracleTextFilteredCards, colorFilters, searchByColorIdentity, colorlessFilter, colorSearchType])

    const cardTypeFilteredCards = React.useMemo(() => {
        const nonEmptyCardTypeFilters = cardTypeFilters.filter(filter => !!filter.cardType)

        if (nonEmptyCardTypeFilters.length === 0) {
            return colorFilteredCards
        }

        const [positiveFilters, negativeFilters] = splitArray(nonEmptyCardTypeFilters, (filter) => !filter.invert)

        return colorFilteredCards.filter((card) =>
            (positiveFilters.length > 0 && cardTypeFilterOperation === 'or'
                ? positiveFilters.some(filter => checkCardTypeFilter(card, filter))
                : positiveFilters.every(filter => checkCardTypeFilter(card, filter)))
            && negativeFilters.every(filter => checkCardTypeFilter(card, filter))
        )
    }, [colorFilteredCards, cardTypeFilters, cardTypeFilterOperation])

    const statFilteredCards = React.useMemo(() => {
        // if (statFilters.length === 0) {
        //     return cardTypeFilteredCards
        // }

        const nonEmptyStatFilters = statFilters.filter(filter => !!filter.value)

        if (nonEmptyStatFilters.length === 0) {
            return cardTypeFilteredCards
        }

        return cardTypeFilteredCards.filter((card) =>
            statFilterOperation === 'or'
                ? nonEmptyStatFilters.some(filter => checkStatFilter(card, filter))
                : nonEmptyStatFilters.every(filter => checkStatFilter(card, filter))
        )
    }, [cardTypeFilteredCards, statFilters, statFilterOperation])

    const sortedCards = React.useMemo(() => {
        const sorted = statFilteredCards.toSorted((cardA, cardB) => CARD_SORTERS[sortType](cardA, cardB, !sortAscending))
        return sorted
    }, [statFilteredCards, sortType, sortAscending])

    const paginatedCards = React.useMemo(() => {
        const minIndex = PAGINATION_LIMIT * searchWindowPageIndex
        return sortedCards.slice(minIndex, minIndex + PAGINATION_LIMIT)
    }, [sortedCards, searchWindowPageIndex])

    const maxPaginationIndex = React.useMemo(() => Math.floor(sortedCards.length / PAGINATION_LIMIT), [sortedCards])

    const filterColor = (color: Color) => {
        setColorlessFilter(false)
        if (colorFilters.includes(color)) {
            setColorFilters(colorFilters.filter(c => c !== color))
        } else {
            setColorFilters([...colorFilters, color])
        }
    }

    const setCardTypeFilterType = (index: number, cardType: string) => {
        const newCardTypeFilters = [...cardTypeFilters]
        newCardTypeFilters[index].cardType = cardType
        setCardTypeFilters(newCardTypeFilters)
    }

    const invertCardTypeFilter = (index: number) => {
        const newCardTypeFilters = [...cardTypeFilters]
        newCardTypeFilters[index].invert = !newCardTypeFilters[index].invert
        setCardTypeFilters(newCardTypeFilters)
    }

    const addCardTypeFilter = () => {
        setCardTypeFilters([...cardTypeFilters, {
            cardType: '',
            invert: false
        }])
    }

    const removeCardTypeFilter = (index: number) => {
        const newCardTypeFilters = [...cardTypeFilters]
        newCardTypeFilters.splice(index, 1)
        setCardTypeFilters(newCardTypeFilters)
    }

    const addOracleTextSearchTerm = () => {
        setPendingOracleTextSearchTerm([...pendingOracleTextSearchTerm, {
            text: '',
            invert: false
        }])
    }

    const removeOracleTextSearchTerm = (index: number) => {
        const newPendingOracleTextSearchTerms = [...pendingOracleTextSearchTerm]
        newPendingOracleTextSearchTerms.splice(index, 1)
        setPendingOracleTextSearchTerm(newPendingOracleTextSearchTerms)
    }

    const setOracleTextSearchTermText = (index: number, text: string) => {
        const newPendingOracleTextSearchTerms = [...pendingOracleTextSearchTerm]
        newPendingOracleTextSearchTerms[index].text = text
        setPendingOracleTextSearchTerm(newPendingOracleTextSearchTerms)
    }

    const invertOracleTextSearchTermText = (index: number) => {
        const newPendingOracleTextSearchTerms = [...pendingOracleTextSearchTerm]
        newPendingOracleTextSearchTerms[index].invert = !newPendingOracleTextSearchTerms[index].invert
        setPendingOracleTextSearchTerm(newPendingOracleTextSearchTerms)
    }

    const addStatFilter = () => {
        setStatFilters([...statFilters, {
            stat: 'mana-value',
            operation: 'equal',
            value: ''
        }])
    }

    const removeStatFilter = (index: number) => {
        const newStatFilters = [...statFilters]
        newStatFilters.splice(index, 1)
        setStatFilters(newStatFilters)
    }

    const updateStatFilterStat = (index: number, stat: StatFilterStat) => {
        const newStatFilters = [...statFilters]
        newStatFilters[index].stat = stat
        setStatFilters(newStatFilters)
    }

    const updateStatFilterOperation = (index: number, operation: StatFilterOperation) => {
        const newStatFilters = [...statFilters]
        newStatFilters[index].operation = operation
        setStatFilters(newStatFilters)
    }

    const updateStatFilterValue = (index: number, value: string) => {
        const newStatFilters = [...statFilters]
        newStatFilters[index].value = value
        setStatFilters(newStatFilters)
    }

    return (
        <div className='card-search-window'>
            <div className='top-bar'>
                <button onClick={back}>Back to deck</button>
                <TextInput
                    type={'search'}
                    label={'Name'}
                    value={pendingNameSearchTerm}
                    onChangeText={setPendingNameSearchTerm}
                />
                {/* <TextInput
                    label={'Card text'}
                    value={pendingOracleTextSearchTerm}
                    onChangeText={setPendingOracleTextSearchTerm}
                /> */}

                <div className='flex-column'>
                    Card text
                    {pendingOracleTextSearchTerm.map((filter, index) =>
                        <div className='flex-row'>
                            <button onClick={() => invertOracleTextSearchTermText(index)} style={{ backgroundColor: filter.invert ? 'red' : undefined }}>-</button>
                            <TextInput
                                type={'search'}
                                value={filter.text}
                                onChangeText={(text) => setOracleTextSearchTermText(index, text)}
                            />
                            {index === pendingOracleTextSearchTerm.length - 1
                                ? <button onClick={addOracleTextSearchTerm}>+</button>
                                : <button onClick={() => removeOracleTextSearchTerm(index)}>X</button>}
                        </div>
                    )}
                </div>

                {ALL_COLOR_KEYS.map(color => <button key={color} className={`search-symbol${!colorFilters.includes(color) ? ' search-symbol-inactive' : ''}`} onClick={() => filterColor(color)}><img src={COLOR_DATA[color].svg_uri} /></button>)}
                {<button className={`search-symbol${!colorlessFilter ? ' search-symbol-inactive' : ''}`} onClick={toggleColorlessFilter}><img src={COLORLESS_DATA.svg_uri} /></button>}
                <Checkbox label="Color identity" checked={searchByColorIdentity} onCheck={setSearchByColorIdentity} />
                {/* <div className='filter'>
                    <label htmlFor="format-select">Format</label>
                    <select id="format-select" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                        {FORMATS.map(format => <option key={format} value={format}>{format}</option>)}
                    </select>
                </div> */}
                <Checkbox label="Show prices" checked={showPrices} onCheck={setShowPrices} />
                <Checkbox label="Show banned cards" checked={showBannedCards} onCheck={setShowBannedCards} />
                <Dropdown label={'Sort by'} options={availableSortTypes} value={sortType} onSelect={setSortType} />
                <Dropdown label={'Type'} options={COLOR_SEARCH_TYPES} value={colorSearchType} onSelect={setColorSearchType} />
                <div className='flex-column'>
                    Card types
                    {cardTypeFilters.map((filter, index) =>
                        <div className='flex-row'>
                            <button onClick={() => invertCardTypeFilter(index)} style={{ backgroundColor: filter.invert ? 'red' : undefined }}>-</button>
                            <TextInputWithSuggestions
                                // label={'Card text'}
                                value={filter.cardType}
                                onChangeText={(text) => setCardTypeFilterType(index, text)}
                                suggestions={['Creature', 'Enchantment', 'Artifact']}
                            />
                            {index === cardTypeFilters.length - 1
                                ? <button onClick={addCardTypeFilter}>+</button>
                                : <button onClick={() => removeCardTypeFilter(index)}>X</button>}
                        </div>
                    )}
                </div>
                <button onClick={() => setCardTypeFilterOperation(nextSearchFilterOperation(cardTypeFilterOperation))}>{SEARCH_FILTER_OPERATION_DATA[cardTypeFilterOperation].label}</button>

                <div className='flex-column'>
                    Card stats
                    {statFilters.map((filter, index) =>
                        <div className='flex-row'>
                            <Dropdown options={STAT_FILTER_STATS} value={filter.stat} onSelect={(stat) => updateStatFilterStat(index, stat)} />
                            <Dropdown options={STAT_FILTER_OPERATIONS} value={filter.operation} onSelect={(operation) => updateStatFilterOperation(index, operation)} />
                            <TextInput
                                type={'search'}
                                value={filter.value}
                                onChangeText={(text) => updateStatFilterValue(index, text)}
                                validator={numbersOnlyTextInputValidator}
                            />
                            {index === cardTypeFilters.length - 1
                                ? <button onClick={addStatFilter}>+</button>
                                : <button onClick={() => removeStatFilter(index)}>X</button>}
                        </div>
                    )}
                </div>
                <button onClick={() => setStatFilterOperation(nextSearchFilterOperation(statFilterOperation))}>{SEARCH_FILTER_OPERATION_DATA[statFilterOperation].label}</button>


                <div className='filter' >
                    <label htmlFor="sort-direction">Sort direction</label>
                    <button onClick={() => setSortAscending(!sortAscending)}>{sortAscending ? 'Ascending' : 'Descending'}</button>
                </div>
                <button onClick={() => setShowNotes(!showNotes)}>Notes</button>
                {showNotes &&
                    <div>
                        <p>For ease of searching, adventure cards and omen cards appear when you filter the color of the adventure or omen. However, note that the color of an adventure card or omen card is the color of the creature part of the card.</p>
                        <p>Card text you type will be checked against cards' oracle text which may not be exactly the same as the text printed on the card.</p>
                        <p>Card prices are estimates and not accurate. Always check the price of the cards in the relevant marketplace.</p>
                    </div>
                }
            </div>
            <div className='flex-row flex-center flex-gap' style={{ marginTop: '12em' }}>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex - 1)} disabled={searchWindowPageIndex === 0}>{'<'}</button>
                <div>{searchWindowPageIndex + 1}</div>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex + 1)} disabled={searchWindowPageIndex === maxPaginationIndex}>{'>'}</button>
            </div>
            <div className='card-search-window-results'>
                {paginatedCards.map((cardData, index) => {
                    return <div className='deck-card' key={index}
                        // style={{transition: 'left 0.5s'}}
                        // style={{ right: `${0.1 * (index + 1)}em` }}
                        // style={{ right: `1em`, transition: `right ${0.1 * (index + 1)}s` }}
                        style={{ animation: `${0.02 * (index + 1)}s linear fade-in forwards` }}
                        onClick={() => addDeckCardQuantity(cardData.name, 1, 'mainboard')}
                        onContextMenu={(e) => { e.preventDefault(); addDeckCardQuantity(cardData.name, -1, 'mainboard') }}>
                        <img src={getCardFrontImage(cardData)?.normal} className='deck-card-image' />
                        {!!deckCards[cardData.name] && <div className='card-count'>x{deckCards[cardData.name].boards.mainboard || deckCards[cardData.name].boards.sideboard ? 0 : ''}{deckCards[cardData.name].boards.sideboard ? ` + ${deckCards[cardData.name].boards.sideboard}` : ''}</div>}
                        {showPrices && <div className='card-count'>{getCardPriceDisplay(cardData)}</div>}
                    </div>
                })}
            </div>
            <div className='flex-row flex-center flex-gap'>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex - 1)} disabled={searchWindowPageIndex === 0}>{'<'}</button>
                <div>{searchWindowPageIndex + 1}</div>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex + 1)} disabled={searchWindowPageIndex === maxPaginationIndex}>{'>'}</button>
            </div>
        </div>
    )
}


