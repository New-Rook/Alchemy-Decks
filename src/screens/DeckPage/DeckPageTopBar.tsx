import React from "react"
import { TextInput } from "../../components/TextInput"
import { CardData, DeckCards, DeckMetaData } from "../../types"
import { getCardFrontImage } from "../../utilities/card"

type Props = {
    cardSearchTerm: string
    setCardSearchTerm: (text: string) => void
    cardSearchResults: CardData[]
    showSearchWindow: () => void
    showDeckMetaDataWindow: () => void
    deckLegal: boolean
    deckMetaData: DeckMetaData
    // deckStats: {
    //     numberOfCards: number
    //     price: number
    // }
    deckCards: DeckCards
    addFromQuickSearch: (cardData: CardData) => void
    pinned: boolean
    setPinned: (value: boolean) => void
}

export const DeckPageTopBar = ({
    cardSearchTerm,
    setCardSearchTerm,
    cardSearchResults,
    showSearchWindow,
    showDeckMetaDataWindow,
    deckLegal,
    deckMetaData,
    // deckStats,
    deckCards,
    addFromQuickSearch,
    pinned,
    setPinned
}: Props) => {
    const copyDeckListToClipboard = async () => {
        const decklistString = Object.keys(deckCards).reduce(
            (decklist, cardName) => `${decklist}${decklist === '' ? '' : '\n'}${deckCards[cardName]} ${cardName}`
            , '')
        await navigator.clipboard.writeText(decklistString)
    }

    return (
        <div className={`card-search${pinned ? ' top-bar-sticky' : ''}`}>
            <div className='stat-row flex-gap'>
                <div className='flex-row'>
                    <TextInput
                        label="Quick search"
                        value={cardSearchTerm}
                        onChangeText={setCardSearchTerm}
                    />
                    <button onClick={showSearchWindow}>Full search</button>
                </div>
                <p className='right-placed-item'>{deckMetaData.format}</p>
                <p >{!deckLegal && `This deck is not legal in ${deckMetaData.format}.`}</p>
                <button onClick={showDeckMetaDataWindow}>Change deck data</button>
                <button onClick={copyDeckListToClipboard}>Copy deck list</button>
                <div className='flex-row flex-gap flex-center'>
                    {/* <div>{Object.keys(deckStats.legalities).map(format => <div key={format}>{format}</div>)}</div> */}
                    {/* <div>{deckStats.numberOfCards}</div> */}
                    {/* <div>€{deckStats.price.toFixed(2)}</div> */}
                    <button onClick={() => setPinned(!pinned)}>{pinned ? 'Unpin' : 'Pin'}</button>
                </div>
            </div>
            {cardSearchResults.slice(0, 5).map(cardData => <button key={cardData.name} className='card-search-result' onClick={() => addFromQuickSearch(cardData)}>
                <img src={getCardFrontImage(cardData)?.art_crop} className='card-search-result-image' /><p>{cardData.name}</p>
            </button>)}
        </div>
    )
}