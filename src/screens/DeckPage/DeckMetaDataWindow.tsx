import React from 'react'
import { DeckMetaData } from '../../types'
import { TextInput } from '../../components/TextInput'
import { Dropdown } from '../../components/Dropdown'
import { VISIBILITY_TYPES } from '../../data/editor'
import { FORMATS } from '../../data/search'

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
                <TextInput
                    label={'Deck name'}
                    value={deckMetaDataDraft.name}
                    onChangeText={(text) => setDeckMetaDataDraft({ ...deckMetaDataDraft, name: text })}
                />
            </div>
            <div className='flex-column'>
                <TextInput
                    label={'Description'}
                    value={deckMetaDataDraft.description}
                    onChangeText={(text) => setDeckMetaDataDraft({ ...deckMetaDataDraft, description: text })}
                />
            </div>
            <div className='flex-column'>
                <Dropdown
                    label={'Format'}
                    value={deckMetaDataDraft.format}
                    options={FORMATS}
                    onSelect={(format) => setDeckMetaDataDraft({ ...deckMetaDataDraft, format })}
                />
            </div>
            <div className='flex-column'>
                <Dropdown
                    label={'Visibility'}
                    value={deckMetaDataDraft.visibility}
                    options={VISIBILITY_TYPES}
                    onSelect={(visibility) => setDeckMetaDataDraft({ ...deckMetaDataDraft, visibility })}
                />
            </div>
            <div className='flex-column'>
                Warnings
                {Object.keys(legalityWarnings).map(cardName =>
                    <p key={cardName} className='flex-row'>
                        {cardName} {legalityWarnings[cardName]}
                    </p>
                )}
            </div>
            <button onClick={back}>Back to deck</button>
            <button onClick={saveChanges}>Save</button>
        </div>
    )
}

