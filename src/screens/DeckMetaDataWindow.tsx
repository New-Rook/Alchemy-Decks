import React from 'react'
import { DeckMetaData } from '../types'

type Props = {
    back: () => void
    save: (deckMetaData: DeckMetaData) => void
    deckMetaData: DeckMetaData
    legalityWarnings: Record<string, string>
}

export const DeckMetaDataWindow = ({ back, save, deckMetaData, legalityWarnings }: Props) => {
    const [deckMetaDataDraft, setDeckMetaDataDraft] = React.useState<DeckMetaData>(deckMetaData)

    const saveChanges = () => {
        save(deckMetaDataDraft)
        back()
    }

    return (
        <div className='card-search-window'>
            <div className='flex-column'>
                Deck name
                {deckMetaData.name}
            </div>
            <div className='flex-column'>
                Description
                {deckMetaData.description}
            </div>
            <div className='flex-column'>
                Warnings
                {Object.keys(legalityWarnings).map(cardName =>
                    <p className='flex-row'>
                        {cardName}
                        {legalityWarnings[cardName]}
                    </p>
                )}
            </div>
            <button onClick={back}>Back to deck</button>
            <button onClick={saveChanges}>Save</button>
        </div>
    )
}

