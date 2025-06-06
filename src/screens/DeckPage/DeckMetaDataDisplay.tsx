import React, { useContext } from "react"
import { TextInput } from "../../components/TextInput"
import { CardData, DeckCards, DeckMetaData, DeckStats } from "../../types"
import { getCardFrontImage } from "../../utilities/card"
import { AppContext } from "../../context/AppContext"
import './DeckMetaDataDisplay.css'
import { Expandable } from "../../components/Expandable"
import { FORMAT_DATA_MAP } from "../../data/general"

type Props = {
    showDeckMetaDataWindow: () => void
    deckMetaData: DeckMetaData
    deckStats: DeckStats
    deckCards: DeckCards
}

export const DeckMetaDataDisplay = ({
    showDeckMetaDataWindow,
    deckMetaData,
    deckStats,
    deckCards,
}: Props) => {
    const { cardDictionary } = useContext(AppContext)

    const copyDeckListToClipboard = async () => {
        const decklistString = Object.keys(deckCards).reduce(
            (decklist, cardName) => `${decklist}${decklist === '' ? '' : '\n'}${deckCards[cardName]} ${cardName}`
            , '')
        await navigator.clipboard.writeText(decklistString)
    }

    return (
        <div className="deck-meta-data-container">
            <div className="deck-meta-data-text-container">
                <p className="text-large">{deckMetaData.name}</p>
                <p className="text-medium">{FORMAT_DATA_MAP[deckMetaData.format].label}</p>
                <p className="text-medium text-danger">{!deckStats.legal && `This deck is not legal in ${deckMetaData.format}.`}</p>
                <Expandable titleProps={{ className: 'button-no-hover' }} titleChildren={'Description'}>
                    <p>{deckMetaData.description}</p>
                </Expandable>
            </div>
            <img className="deck-meta-data-background" src={cardDictionary['Dragonmaster Outcast'].image_uris.art_crop} />
            <div className="flex-row flex-gap base-offset-left">
                <button onClick={showDeckMetaDataWindow}>Change deck data</button>
                <button onClick={copyDeckListToClipboard}>Copy deck list</button>
            </div>
        </div>
    )
}