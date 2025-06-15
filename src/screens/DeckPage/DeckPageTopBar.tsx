import React, { useContext } from "react"
import { TextInput } from "../../components/TextInput"
import { CardData, DeckCards, DeckMetaData, DeckStats } from "../../types"
import { getCardFrontImage } from "../../utilities/card"
import { Icon } from "../../components/Icon"
import { IconButton } from "../../components/IconButton"
import { UserContext } from "../../context/UserContext"
import { addCurrencyToText } from "../../utilities/general"

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

const NUMBER_OF_CARD_SEARCH_RESULTS_TO_SHOW = 5

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
                <IconButton iconName="search" onClick={showSearchWindow}>Full search</IconButton>
                <div className="flex-row flex-gap right-placed-item">
                    <div className="flex-column">
                        Deck size
                        <div>{deckStats.mainboard.numberOfCards}{deckStats.sideboard.numberOfCards > 0 && ` + ${deckStats.sideboard.numberOfCards}`}</div>
                    </div>
                    <div className="flex-column">
                        Deck price
                        {/* <div>{deckStats.mainboard.price}{deckStats.sideboard.price > 0 && ` + ${deckStats.sideboard.price}`}</div> */}
                        <div>
                            {addCurrencyToText(deckStats.sideboard.price === 0
                                ? deckStats.mainboard.price
                                : `${(deckStats.mainboard.price + deckStats.sideboard.price).toFixed(2)} (${deckStats.mainboard.price} + ${deckStats.sideboard.price}))`,
                                userData?.settings.currency ?? 'eur')}
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
            <div className="card-search-results">
                {cardSearchResults.slice(0, NUMBER_OF_CARD_SEARCH_RESULTS_TO_SHOW).map((cardData, index) =>
                    <button key={cardData.name}
                        className={`card-search-result 
                            ${index === NUMBER_OF_CARD_SEARCH_RESULTS_TO_SHOW - 1
                                ? 'border-rounded-bottom'
                                : 'dropdown-option'
                            }`}
                        onClick={() => addFromQuickSearch(cardData)}>
                        <img src={getCardFrontImage(cardData)?.art_crop} className='card-search-result-image' /><p>{cardData.name}</p>
                    </button>
                )}
            </div>
        </div>
    )
}
