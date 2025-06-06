import React, { useContext } from "react"
import { TextInput } from "../../components/TextInput"
import { CardData, DeckCards, DeckMetaData, DeckStats } from "../../types"
import { getCardFrontImage } from "../../utilities/card"
import { Icon } from "../../components/Icon"
import { IconButton } from "../../components/IconButton"
import { UserContext } from "../../context/UserContext"

type Props = {
    cardSearchTerm: string
    setCardSearchTerm: (text: string) => void
    cardSearchResults: CardData[]
    showSearchWindow: () => void
    deckStats: DeckStats
    addFromQuickSearch: (cardData: CardData) => void
    pinned: boolean
    setPinned: (value: boolean) => void
}

export const DeckPageTopBar = ({
    cardSearchTerm,
    setCardSearchTerm,
    cardSearchResults,
    showSearchWindow,
    deckStats,
    addFromQuickSearch,
    pinned,
    setPinned
}: Props) => {
    const { userData } = useContext(UserContext)
    return (
        <div className={`deck-top-bar ${pinned ? 'top-bar-sticky' : ''}`}>
            <div className='menu-bar align-end'>
                <div className='flex-row'>
                    <TextInput
                        type={'search'}
                        label="Quick search"
                        value={cardSearchTerm}
                        onChangeText={setCardSearchTerm}
                    />
                </div>
                <button onClick={showSearchWindow}>Full search</button>
                <div className="flex-row flex-gap right-placed-item">
                    <div className="flex-column">
                        Deck size
                        <div>{deckStats.mainboard.numberOfCards}{deckStats.sideboard.numberOfCards > 0 && ` + ${deckStats.sideboard.numberOfCards}`}</div>
                    </div>
                    <div className="flex-column">
                        Deck price
                        {/* <div>{deckStats.mainboard.price}{deckStats.sideboard.price > 0 && ` + ${deckStats.sideboard.price}`}</div> */}
                        <div>
                            {userData?.settings.currency === 'usd' && '$'}
                            {deckStats.sideboard.price === 0
                                ? deckStats.mainboard.price
                                : `${(deckStats.mainboard.price + deckStats.sideboard.price).toFixed(2)} (${deckStats.mainboard.price} + ${deckStats.sideboard.price}))`}
                            {userData?.settings.currency === 'eur' && '€'}
                        </div>
                    </div>
                    <div className='flex-row flex-gap flex-center'>
                        {/* <div>{Object.keys(deckStats.legalities).map(format => <div key={format}>{format}</div>)}</div> */}
                        {/* <div>{deckStats.numberOfCards}</div> */}
                        {/* <div>€{deckStats.price.toFixed(2)}</div> */}
                        {/* <button className="base-padding" onClick={() => setPinned(!pinned)}><Icon name={pinned ? 'keep_off' : 'keep'} /></button> */}
                        <IconButton iconName={pinned ? 'keep_off' : 'keep'} onClick={() => setPinned(!pinned)} />
                    </div>
                </div>
            </div>
            {cardSearchResults.slice(0, 5).map(cardData => <button key={cardData.name} className='card-search-result' onClick={() => addFromQuickSearch(cardData)}>
                <img src={getCardFrontImage(cardData)?.art_crop} className='card-search-result-image' /><p>{cardData.name}</p>
            </button>)}
        </div>
    )
}