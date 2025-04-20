import { useContext } from 'react'
import './App.css'
import React from 'react'
import { AppContext } from './AppContext'
import { CardData, Color, CurrencyType, Format, SortType } from './types'
import { SORT_TYPES, ALL_COLOR_KEYS, COLOR_DATA, FORMATS } from './data'
import { CARD_SORTERS, getCardAllCardName, getCardAllOracleText, getCardImages } from './utilities/card'
import { TextInput } from './TextInput'
import { stringStartsAndEndsWith } from './utilities/general'

type Props = {
    back: () => void
    deckCards: Record<string, number>
    onChangeCardCount: (cardData: CardData, quantity: number) => void
    searchTerm: string
    onChangeSearchTerm: (text: string) => void
}

const PAGINATION_LIMIT = 100
const searchRegex = /\w+|"[\w ]+"/g

export const SearchWindow = ({ back, deckCards, onChangeCardCount, searchTerm, onChangeSearchTerm }: Props) => {
    const { currentDeckID, cardDictionary } = useContext(AppContext)

    const [searchWindowPageIndex, setSearchWindowPageIndex] = React.useState(0)
    const [format, setFormat] = React.useState<Format>('standard')
    const [sortType, setSortType] = React.useState<SortType>('mana-value')
    const [sortAscending, setSortAscending] = React.useState(true)
    const [currencyType, setCurrencyType] = React.useState<CurrencyType>('eur')
    const [colorFilters, setColorFilters] = React.useState<Color[]>([])
    const [oracleTextSearchTerm, setOracleTextSearchTerm] = React.useState('')

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
        // const trimmedSearchTerm = searchTerm.trim()
        const searchTerms = searchTerm.match(searchRegex)
        // console.log(searchTerms)
        // console.log(results)
        // console.log(results?.map((res) => stringStartsAndEndsWith(res, '"')))
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
    }, [legalCards, searchTerm])

    // const searchTermOracleTextFilteredCards = React.useMemo(() => {
    //     const trimmedSearchTerm = oracleTextSearchTerm.trim()
    //     if (!trimmedSearchTerm) {
    //         return searchTermNameFilteredCards
    //     }
    //     const regex = new RegExp(trimmedSearchTerm.toLocaleLowerCase())
    //     return searchTermNameFilteredCards.filter(card => regex.test(getCardAllOracleText(card).toLocaleLowerCase()))
    // }, [searchTermNameFilteredCards, oracleTextSearchTerm])

    const searchTermOracleTextFilteredCards = React.useMemo(() => {
        const searchTerms = oracleTextSearchTerm.match(searchRegex)
        // console.log(searchTerms)
        // console.log(results)
        // console.log(results?.map((res) => stringStartsAndEndsWith(res, '"')))
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
        // const sorted = colorFilteredCards.toSorted(CARD_SORTERS[sortType])
        // return sortAscending ? sorted : sorted.toReversed()
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
                    value={searchTerm}
                    onChangeText={onChangeSearchTerm}
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
                    // console.log(cardData.prices.eur)
                    return <div className='deck-card' key={cardData.name} onClick={() => onChangeCardCount(cardData, (deckCards[cardData.name] ?? 0) + 1)} onContextMenu={(e) => { e.preventDefault(); onChangeCardCount(cardData, (deckCards[cardData.name] ?? 0) - 1) }}>
                        <img src={getCardImages(cardData)?.normal} className='deck-card-image' />
                        {!!deckCards[cardData.name] && <div className='card-count'>x{deckCards[cardData.name]}</div>}
                        <div className='card-count'>€{cardData.prices.eur}</div>
                    </div>
                }
                )}
            </div>
        </div>
    )
}
