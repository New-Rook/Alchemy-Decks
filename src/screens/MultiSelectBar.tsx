import React from "react"
import { TextInput } from "../components/TextInput"
import { Board, CardArtData, DeckCards, DeckStats } from "../types"
import { combineTextInputValidators, numbersLimitTextInputValidator, numbersOnlyTextInputValidator, omitFromPartialRecord } from "../utilities/general"
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

    const updateSelectedCardsRef = React.useRef<() => void>(null)

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
                const board = selectedCards[cardName]
                if (quantity === 0) {
                    if (Object.keys(deckCards[cardName].boards).length === 1) {
                        delete newDeckCards[cardName]
                        return
                    }

                    newDeckCards[cardName].boards = omitFromPartialRecord(deckCards[cardName].boards, board)
                }
                else {
                    newDeckCards[cardName].boards[board] = quantity
                }
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

    React.useEffect(() => {
        const triggerUpdateSelectedCards = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && updateSelectedCardsRef.current) {
                updateSelectedCardsRef.current()
            }
        }

        window.addEventListener('keyup', triggerUpdateSelectedCards)

        return () => window.removeEventListener('keyup', triggerUpdateSelectedCards)
    }, [])

    React.useEffect(() => {
        updateSelectedCardsRef.current = updateSelectedCards
    }, [updateSelectedCards])


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
        <button onClick={updateSelectedCards} disabled={!categoryUpdateText.trim() && !quantityUpdateText}>Update cards</button>
        <button onClick={removeSelectedCardsCategories}>Remove categories</button>
        <button onClick={removeSelectedCards}>Remove cards</button>
        <button onClick={showCardArtWindow} disabled={Object.keys(selectedCards).length > 150}>Change card art</button>
        <button onClick={() => moveSelectedCardsToBoard('mainboard')}>Move to mainboard</button>
        <button onClick={() => moveSelectedCardsToBoard('sideboard')}>Move to sideboard</button>
        <button onClick={() => moveSelectedCardsToBoard('considering')}>Move to considering</button>
        <button onClick={deselectAllCards}>Deselect cards</button>
        {cardArtWindowVisible && <CartArtWindow back={hideCardArtWindow} save={saveArtChanges} selectedCards={selectedCards} deckCards={deckCards} />}
    </div>
}
