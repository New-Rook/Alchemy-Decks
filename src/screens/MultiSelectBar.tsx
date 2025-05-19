import React from "react"
import { TextInput } from "../components/TextInput"
import { Board, CardArtData, DeckCards, DeckStats } from "../types"
import { combineTextInputValidators, numbersLimitTextInputValidator, numbersOnlyTextInputValidator } from "../utilities/general"
import { CartArtWindow } from "./CartArtWindow"
import { useBooleanState } from "../hooks/useBooleanState"

type Props = {
    deckCards: DeckCards
    setDeckCards: (value: DeckCards) => void
    selectedCards: Record<string, Board>
    setSelectedCards: (value: Record<string, Board>) => void
}

export const MultiSelectBar = ({ deckCards, setDeckCards, selectedCards, setSelectedCards }: Props) => {
    const [categoryUpdateText, setCategoryUpdateText] = React.useState('')
    const [quantityUpdateText, setQuantityUpdateText] = React.useState('')

    const [cardArtWindowVisible, showCardArtWindow, hideCardArtWindow] = useBooleanState()

    const moveSelectedCardsToBoard = (board: Board) => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            const currentBoard = selectedCards[cardName]
            const quantity = newDeckCards[cardName].boards[currentBoard]
            delete newDeckCards[cardName].boards[currentBoard]
            newDeckCards[cardName].boards[board] = (newDeckCards[cardName].boards[board] ?? 0) + (quantity ?? 0)
        })

        setDeckCards(newDeckCards)
        setSelectedCards({})
    }

    const updateSelectedCards = () => {
        const newDeckCards = { ...deckCards }

        const quantity = parseInt(quantityUpdateText)
        // const categories = categoryUpdateText.split(/ +/).filter(category => !!category)
        const category = categoryUpdateText.trim()

        Object.keys(selectedCards).forEach((cardName) => {
            if (Number.isInteger(quantity)) {
                newDeckCards[cardName].boards[selectedCards[cardName]] = parseInt(quantityUpdateText)
            }
            if (category) {
                if (!newDeckCards[cardName].categories) {
                    newDeckCards[cardName].categories = []
                }
                // if (categoryUpdateOperation === 'add') {
                const uniqueCategories = new Set([...newDeckCards[cardName].categories, category])
                newDeckCards[cardName].categories = Array.from(uniqueCategories)
                // }
                // else {
                //     newDeckCards[cardName].categories = categories
                // }
            }
        })

        setDeckCards(newDeckCards)
        setCategoryUpdateText('')
        setQuantityUpdateText('')
        setSelectedCards({})
    }

    const removeSelectedCards = () => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            delete newDeckCards[cardName]
        })

        setDeckCards(newDeckCards)
        setSelectedCards({})
    }

    const removeSelectedCardsCategories = () => {
        const newDeckCards = { ...deckCards }

        Object.keys(selectedCards).forEach((cardName) => {
            newDeckCards[cardName].categories = undefined
        })

        setDeckCards(newDeckCards)
    }

    const deselectAllCards = () => {
        setSelectedCards({})
    }

    const saveArtChanges = (cardArtMap: Record<string, CardArtData>) => {
        const newDeckCards = { ...deckCards }

        Object.keys(cardArtMap).forEach((cardName) => {
            if (newDeckCards[cardName].print?.set === cardArtMap[cardName].set) {
                return
            }

            newDeckCards[cardName] = {
                ...newDeckCards[cardName],
                print: {
                    set: cardArtMap[cardName].set,
                    uris: cardArtMap[cardName].image_uris.map(image => image.normal)
                }
            }
        })

        setDeckCards(newDeckCards)
        setCategoryUpdateText('')
        setQuantityUpdateText('')
        setSelectedCards({})
    }

    return <div style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        backgroundColor: 'white',
        flexDirection: 'row',
        display: 'flex',
        gap: '2em',
        padding: '0.5em'
    }}>
        <TextInput label={'Add category'} value={categoryUpdateText} onChangeText={setCategoryUpdateText} />
        <TextInput label={'Quantity'} value={quantityUpdateText} onChangeText={setQuantityUpdateText} validator={combineTextInputValidators(numbersOnlyTextInputValidator, numbersLimitTextInputValidator(99))} />
        <button onClick={updateSelectedCards}>Update cards</button>
        <button onClick={removeSelectedCardsCategories}>Remove categories</button>
        <button onClick={removeSelectedCards}>Remove cards</button>
        <button onClick={showCardArtWindow}>Change card art</button>
        <button onClick={() => moveSelectedCardsToBoard('mainboard')}>Move to mainboard</button>
        <button onClick={() => moveSelectedCardsToBoard('sideboard')}>Move to sideboard</button>
        <button onClick={() => moveSelectedCardsToBoard('considering')}>Move to considering</button>
        <button onClick={deselectAllCards}>Deselect cards</button>
        {cardArtWindowVisible && <CartArtWindow back={hideCardArtWindow} save={saveArtChanges} selectedCards={selectedCards} deckCards={deckCards} />}
    </div>
}
