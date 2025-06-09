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
import { checkCardTypeFilter, checkOracleTextSearchTermFilter, checkStatFilter, nextSearchFilterOperation, searchTermFilterToRegexes, STICKERS_ATTRACTIONS_REGEX } from '../utilities/search'
import { TextInputWithSuggestions } from '../components/TextInputWithSuggestions'
import './SearchWindow.css'
import { IconButton } from '../components/IconButton'
import { Label } from '../components/Label'
import { Expandable } from '../components/Expandable'

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
    const [showStickersAndAttractions, setShowStickersAndAttractions] = useAdvancedState(false, resetPageIndex)
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
        return allCards.filter(card => {
            const legal = card.legalities[format] === 'legal'
                || card.legalities[format] === 'restricted'
                || (card.legalities[format] === 'banned' && showBannedCards)

            if (legal) {
                return showStickersAndAttractions
                    || !STICKERS_ATTRACTIONS_REGEX.test(card.type_line)
            }

            return false
        })
    }, [format, showBannedCards, showStickersAndAttractions])

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
            <div className='search-window-top-bar'>
                <IconButton iconName={'chevron_left'} onClick={back} />

                <div className='flex-column flex-gap'>
                    <div className='flex-row flex-gap'>
                        {ALL_COLOR_KEYS.map(color => <button key={color} className={`search-symbol${!colorFilters.includes(color) ? ' search-symbol-inactive' : ''}`} onClick={() => filterColor(color)}><img src={COLOR_DATA[color].svg_uri} /></button>)}
                        {<button className={`search-symbol${!colorlessFilter ? ' search-symbol-inactive' : ''}`} onClick={toggleColorlessFilter}><img src={COLORLESS_DATA.svg_uri} /></button>}
                    </div>
                    <div className='flex-row flex-gap'>
                        <Dropdown options={COLOR_SEARCH_TYPES} value={colorSearchType} onSelect={setColorSearchType} size={'small'} />
                        <Checkbox label="Color identity" checked={searchByColorIdentity} onCheck={setSearchByColorIdentity} />
                    </div>
                </div>

                <TextInput
                    containerProps={{ className: 'flex-gap-small' }}
                    type={'search'}
                    label={'Name'}
                    value={pendingNameSearchTerm}
                    onChangeText={setPendingNameSearchTerm}
                />

                <div className='flex-column flex-gap-small'>
                    <Label>Card text</Label>
                    {pendingOracleTextSearchTerm.map((filter, index) =>
                        <div className='flex-row'>
                            <IconButton iconName={'remove'} className={`border-rounded-left ${filter.invert ? 'background-danger' : ''}`} size={'small'} onClick={() => invertOracleTextSearchTermText(index)} style={{ backgroundColor: filter.invert ? 'red' : undefined }} />
                            <TextInput
                                type={'search'}
                                value={filter.text}
                                onChangeText={(text) => setOracleTextSearchTermText(index, text)}
                            />
                            {index === pendingOracleTextSearchTerm.length - 1
                                ? <IconButton iconName={'add'} className='border-rounded-right' size={'small'} onClick={addOracleTextSearchTerm} />
                                : <IconButton iconName={'close'} className='border-rounded-right' size={'small'} onClick={() => removeOracleTextSearchTerm(index)} />}
                        </div>
                    )}
                </div>

                <div className='flex-column flex-gap-small'>
                    <Label>Card types</Label>
                    {cardTypeFilters.map((filter, index) =>
                        <div className='flex-row'>
                            <IconButton iconName={'remove'} className={`border-rounded-left ${filter.invert ? 'background-danger' : ''}`} size={'small'} onClick={() => invertCardTypeFilter(index)} />
                            <TextInputWithSuggestions
                                className='input-medium'
                                value={filter.cardType}
                                onChangeText={(text) => setCardTypeFilterType(index, text)}
                                suggestions={['Creature', 'Enchantment', 'Artifact']}
                            />
                            {index === cardTypeFilters.length - 1
                                // ? <button onClick={addCardTypeFilter}>+</button>
                                ? <IconButton iconName={'add'} className='border-rounded-right' size={'small'} onClick={addCardTypeFilter} />
                                : <IconButton iconName={'close'} className='border-rounded-right' size={'small'} onClick={() => removeCardTypeFilter(index)} />
                            }
                            {index === 0 && <button className='flex-row flex-center base-width-4 base-offset-left' onClick={() => setCardTypeFilterOperation(nextSearchFilterOperation(cardTypeFilterOperation))}>{SEARCH_FILTER_OPERATION_DATA[cardTypeFilterOperation].label}</button>}
                        </div>
                    )}
                </div>

                <div className='flex-column flex-gap-small'>
                    <Label>Card stats</Label>
                    {statFilters.map((filter, index) =>
                        <div className='flex-row flex-gap-small'>
                            <Dropdown options={STAT_FILTER_STATS} value={filter.stat} onSelect={(stat) => updateStatFilterStat(index, stat)} />
                            <Dropdown options={STAT_FILTER_OPERATIONS} value={filter.operation} onSelect={(operation) => updateStatFilterOperation(index, operation)} />
                            <TextInput
                                type={'search'}
                                className='input-tiny'
                                value={filter.value}
                                onChangeText={(text) => updateStatFilterValue(index, text)}
                                validator={numbersOnlyTextInputValidator}
                            />
                            {index === statFilters.length - 1
                                ? <IconButton iconName={'add'} size='small' onClick={addStatFilter} />
                                : <IconButton iconName={'close'} size='small' onClick={() => removeStatFilter(index)} />
                            }
                            {index === 0 && <button className='flex-row flex-center base-width-4' onClick={() => setStatFilterOperation(nextSearchFilterOperation(statFilterOperation))}>{SEARCH_FILTER_OPERATION_DATA[statFilterOperation].label}</button>}
                        </div>
                    )}
                </div>

                <div className='flex-column'>
                    <Checkbox label="Show stickers/attractions" checked={showStickersAndAttractions} onCheck={setShowStickersAndAttractions} />
                    <Checkbox label="Show banned cards" checked={showBannedCards} onCheck={setShowBannedCards} />
                    <Checkbox label="Show prices" checked={showPrices} onCheck={setShowPrices} />
                </div>

                <div className='flex-row flex-gap-small align-end'>
                    <Dropdown label={'Sort by'} options={availableSortTypes} value={sortType} onSelect={setSortType} />
                    <IconButton iconName={sortAscending ? 'arrow_upward' : 'arrow_downward'} size={'small'} onClick={() => setSortAscending(!sortAscending)} />
                </div>

                {/* <br /> */}
                <Expandable titleProps={{ className: 'button-no-hover' }} titleChildren={'Notes'}>
                    <div>
                        <p>For ease of searching, adventure cards and omen cards appear when you filter the color of the adventure or omen. However, note that the color of an adventure card or omen card is the color of the creature part of the card.</p>
                        <p>Card text you type will be checked against cards' oracle text which may not be exactly the same as the text printed on the card.</p>
                        <p>Card prices are estimates and not accurate. Always check the price of the cards in the relevant marketplace.</p>
                    </div>
                </Expandable>
                {/* <button onClick={() => setShowNotes(!showNotes)}>Notes</button>
                {showNotes &&
                    <div>
                        <p>For ease of searching, adventure cards and omen cards appear when you filter the color of the adventure or omen. However, note that the color of an adventure card or omen card is the color of the creature part of the card.</p>
                        <p>Card text you type will be checked against cards' oracle text which may not be exactly the same as the text printed on the card.</p>
                        <p>Card prices are estimates and not accurate. Always check the price of the cards in the relevant marketplace.</p>
                    </div>
                } */}
            </div>
            <div className='flex-row flex-center flex-gap'>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex - 1)} disabled={searchWindowPageIndex === 0}>{'<'}</button>
                <div>{searchWindowPageIndex + 1}</div>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex + 1)} disabled={searchWindowPageIndex === maxPaginationIndex}>{'>'}</button>
            </div>
            <div className='card-search-window-results'>
                {paginatedCards.map((cardData, index) => {
                    return <div className='deck-card card-preview' key={index}
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


