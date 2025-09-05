import React, { useContext } from "react"
import { TextInput } from "../../components/TextInput"
import { CardData, DeckCards, DeckMetaData, DeckStats } from "../../types"
import { getCardFrontImage } from "../../utilities/card"
import { AppContext } from "../../context/AppContext"
import './DeckMetaDataDisplay.css'
import { Expandable } from "../../components/Expandable"
import { FORMAT_DATA_MAP } from "../../data/general"
import { IconButton } from "../../components/IconButton"
import { Dropdown } from "../../components/Dropdown"
import { FORMATS } from "../../data/search"
import { VISIBILITY_TYPES } from "../../data/editor"
import { TextArea } from "../../components/TextArea"
import { lengthLimitTextInputValidator } from "../../utilities/general"

type Props = {
    deckMetaData: DeckMetaData
    setDeckMetaData: (value: DeckMetaData) => void
    deckStats: DeckStats
    deckCards: DeckCards
}

export const DeckMetaDataDisplay = ({
    deckMetaData,
    setDeckMetaData,
    deckStats,
    deckCards
}: Props) => {
    const { cardDictionary } = useContext(AppContext)

    const [isEditMode, setIsEditMode] = React.useState(false)

    const [draft, setDraft] = React.useState<DeckMetaData>(deckMetaData)
    const [deckNameWarning, setDeckNameWarning] = React.useState('')

    const setEditMode = (value: boolean) => {
        setDeckNameWarning('')
        setIsEditMode(value)
    }

    const enterEditMode = () => {
        setEditMode(true)
    }

    const saveChanges = () => {
        if (!draft.name.trim()) {
            setDeckNameWarning('Deck name cannot be empty.')
            return
        }

        setDeckMetaData(draft)
        setEditMode(false)
    }

    const cancelEdit = () => {
        setDraft(deckMetaData)
        setEditMode(false)
    }

    const copyDeckListToClipboard = async () => {
        const decklistString = Object.keys(deckCards).reduce(
            (decklist, cardName) => {
                const deckCard = deckCards[cardName]
                if (deckCard.boards.mainboard || deckCard.boards.sideboard) {
                    return `${decklist}${decklist === '' ? '' : '\n'}${(deckCards[cardName].boards.mainboard ?? 0) + (deckCards[cardName].boards.sideboard ?? 0)} ${cardName}`
                }
                return decklist
            }
            , '')
        await navigator.clipboard.writeText(decklistString)
    }

    return (
        <div className="deck-meta-data-container">
            <div className="deck-meta-data-text-container">
                {isEditMode
                    ? <TextInput label="Name" className="full-width" value={draft.name} onChangeText={text => setDraft(prev => ({ ...prev, name: text }))} validator={lengthLimitTextInputValidator(80)} />
                    : <p className="text-large">{deckMetaData.name}</p>
                }
                {deckNameWarning && <p className='text-danger text-medium'>{deckNameWarning}</p>}
                {isEditMode ?
                    <Dropdown
                        label={'Format'}
                        value={draft.format}
                        options={FORMATS}
                        onSelect={(format) => setDraft(prev => ({ ...prev, format }))}
                    /> : <p className="text-medium">{FORMAT_DATA_MAP[deckMetaData.format].label}</p>
                }
                {!isEditMode && <p className="text-medium text-danger">{!deckStats.legal && `This deck is not legal in ${deckMetaData.format}.`}</p>}
                <Expandable
                    className="no-margin"
                    titleProps={{ className: 'button-no-hover' }}
                    titleChildren={'Description'}
                    contentProps={{ className: 'expandable-textarea' }}>
                    {isEditMode ?
                        <TextArea value={draft.description} onChangeText={text => setDraft(prev => ({ ...prev, description: text }))} validator={lengthLimitTextInputValidator(1000)} />
                        : <p>{deckMetaData.description}</p>
                    }
                </Expandable>
                {isEditMode && <Dropdown
                    label={'Visibility'}
                    value={draft.visibility}
                    options={VISIBILITY_TYPES}
                    onSelect={(visibility) => setDraft(prev => ({ ...prev, visibility }))}
                />}
            </div>
            <img className="deck-meta-data-background" src={cardDictionary['Dragonmaster Outcast'].image_uris.art_crop} />
            <div className="flex-row flex-gap base-offset-left">
                <IconButton iconName={isEditMode ? 'close' : 'edit'} onClick={isEditMode ? cancelEdit : enterEditMode}>
                    {isEditMode ? 'Cancel' : 'Edit'}
                </IconButton>
                {isEditMode && <IconButton iconName="check" onClick={saveChanges}>Save</IconButton>}
                <IconButton iconName="content_copy" onClick={copyDeckListToClipboard}>Copy deck list</IconButton>
            </div>

            <div className="deck-meta-data-text-container base-offset-top expandable-textarea">
                <span className="base-offset-left text-medium">Deck Warnings</span>
                {deckStats.deckLegalityWarnings.map((warning) =>
                    <p key={warning} className="text-danger">{warning}</p>
                )}
                {Object.keys(deckStats.legalityWarnings).map((cardName) =>
                    <p key={cardName}>
                        {cardName}: <span className="text-danger">{deckStats.legalityWarnings[cardName]}</span>
                    </p>
                )}
            </div>
        </div>
    )
}