import { useContext } from 'react'
import React from 'react'
import { AppContext } from '../context/AppContext'
import { CardData, Color, CurrencyType, Format, SortType } from '../types'
import { SORT_TYPES, ALL_COLOR_KEYS, COLOR_DATA, FORMATS } from '../data/search'
import { CARD_SORTERS, getCardAllCardName, getCardAllOracleText, getCardImages } from '../utilities/card'
import { TextInput } from '../components/TextInput'
import { stringStartsAndEndsWith } from '../utilities/general'
import { useAdvancedState } from '../hooks/useAdvancedState'

type Props = {
    back: () => void
    deckCards: Record<string, number>
    onChangeCardCount: (cardData: CardData, quantity: number) => void
}

const PAGINATION_LIMIT = 100
const searchRegex = /\w+|"[\w ]+"/g

export const SearchWindow = ({ back, deckCards, onChangeCardCount }: Props) => {
    const { currentDeckID, cardDictionary } = useContext(AppContext)

    const [searchWindowPageIndex, setSearchWindowPageIndex] = React.useState(0)

    const resetPageIndex = React.useCallback(() => {
        setSearchWindowPageIndex(0)
    }, [])

    const [format, setFormat] = useAdvancedState<Format>('standard', resetPageIndex)
    const [sortType, setSortType] = useAdvancedState<SortType>('mana-value', resetPageIndex)
    const [sortAscending, setSortAscending] = useAdvancedState(true, resetPageIndex)
    const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')
    const [colorFilters, setColorFilters] = useAdvancedState<Color[]>([], resetPageIndex)
    const [oracleTextSearchTerm, setOracleTextSearchTerm] = useAdvancedState('', resetPageIndex)
    const [nameSearchTerm, setNameSearchTerm] = useAdvancedState('', resetPageIndex)

    const getCardPriceDisplay = React.useCallback((cardData: CardData) => {
        if (currencyType === 'eur') {
            if (cardData.prices.eur !== '0.00') {
                return `€${cardData.prices.eur}`
            }
            if (cardData.prices.eur_foil !== '0.00') {
                return `€${cardData.prices.eur_foil}`
            }
        }
        else {
            if (cardData.prices.usd !== '0.00') {
                return `$${cardData.prices.usd}`
            }
            if (cardData.prices.usd_foil !== '0.00') {
                return `$${cardData.prices.usd_foil}`
            }
        }

        return '---'
    }, [currencyType])

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

    const legalCards = React.useMemo(() => {
        return Object.values(cardDictionary).filter(card => card.legalities[format] === 'legal' || card.legalities[format] === 'restricted')
    }, [cardDictionary, format])

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
        const searchTerms = oracleTextSearchTerm.match(searchRegex)
        if (!searchTerms) {
            return searchTermNameFilteredCards
        }
        return searchTermNameFilteredCards.filter(card => {
            const cardOracleTexts = getCardAllOracleText(card).toLocaleLowerCase()
            return searchTerms.every(text => {
                const regex = new RegExp(stringStartsAndEndsWith(text, '"') ? text.slice(1, -1).toLocaleLowerCase() : text.toLocaleLowerCase())
                return regex.test(cardOracleTexts)
            })
        })
    }, [searchTermNameFilteredCards, oracleTextSearchTerm])

    const colorFilteredCards = React.useMemo(() => {
        return searchTermOracleTextFilteredCards.filter(card => card.colors && colorFilters.every(color => card.colors.includes(color)))
    }, [searchTermOracleTextFilteredCards, colorFilters])

    const sortedCards = React.useMemo(() => {
        const sorted = colorFilteredCards.toSorted((cardA, cardB) => CARD_SORTERS[sortType](cardA, cardB, !sortAscending))
        return sorted
    }, [colorFilteredCards, sortType, sortAscending])

    const paginatedCards = React.useMemo(() => {
        const minIndex = PAGINATION_LIMIT * searchWindowPageIndex
        return sortedCards.slice(minIndex, minIndex + PAGINATION_LIMIT)
    }, [sortedCards, searchWindowPageIndex])

    const maxPaginationIndex = React.useMemo(() => Math.floor(colorFilteredCards.length / PAGINATION_LIMIT), [colorFilteredCards])

    const filterColor = (color: Color) => {
        if (colorFilters.includes(color)) {
            setColorFilters(colorFilters.filter(c => c !== color))
        } else {
            setColorFilters([...colorFilters, color])
        }
    }

    return (
        <div className='card-search-window'>
            <div className='top-bar'>
                <button onClick={back}>Back to deck</button>
                <TextInput
                    label={'Name'}
                    type="text"
                    id="name"
                    name="name"
                    size={10}
                    value={nameSearchTerm}
                    onChangeText={setNameSearchTerm}
                />
                <TextInput
                    label={'Card text'}
                    type="text"
                    id="name"
                    name="name"
                    size={10}
                    value={oracleTextSearchTerm}
                    onChangeText={setOracleTextSearchTerm}
                />
                {ALL_COLOR_KEYS.map(color => <button key={color} className={`search-symbol${!colorFilters.includes(color) ? ' search-symbol-inactive' : ''}`} onClick={() => filterColor(color)}><img src={COLOR_DATA[color].svg_uri} /></button>)}
                <div className='filter' >
                    <label htmlFor="format-select">Format</label>
                    <select id="format-select" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                        {FORMATS.map(format => <option key={format} value={format}>{format}</option>)}
                    </select>
                </div>
                <div className='filter' >
                    <label htmlFor="sort-select">Sort by</label>
                    <select id="sort-select" value={sortType} onChange={(e) => setSortType(e.target.value as SortType)}>
                        {availableSortTypes.map(sortType => <option key={sortType} value={sortType}>{sortType}</option>)}
                    </select>
                </div>
                <div className='filter' >
                    <label htmlFor="sort-direction">Sort direction</label>
                    <button onClick={() => setSortAscending(!sortAscending)}>{sortAscending ? 'Ascending' : 'Descending'}</button>
                </div>
            </div>
            <div className='flex-row flex-center flex-gap'>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex - 1)} disabled={searchWindowPageIndex === 0}>{'<'}</button>
                <div>{searchWindowPageIndex + 1}</div>
                <button onClick={() => setSearchWindowPageIndex(searchWindowPageIndex + 1)} disabled={searchWindowPageIndex === maxPaginationIndex}>{'>'}</button>
            </div>
            <div className='card-search-window-results'>
                {paginatedCards.map(cardData => {
                    return <div className='deck-card' key={cardData.name} onClick={() => onChangeCardCount(cardData, (deckCards[cardData.name] ?? 0) + 1)} onContextMenu={(e) => { e.preventDefault(); onChangeCardCount(cardData, (deckCards[cardData.name] ?? 0) - 1) }}>
                        <img src={getCardImages(cardData)?.normal} className='deck-card-image' />
                        {!!deckCards[cardData.name] && <div className='card-count'>x{deckCards[cardData.name]}</div>}
                        <div className='card-count'>{getCardPriceDisplay(cardData)}</div>
                    </div>
                }
                )}
            </div>
        </div>
    )
}

