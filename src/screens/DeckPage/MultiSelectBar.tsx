import React from "react"
import { TextInput } from "../../components/TextInput"
import { Board, CardArtData, DeckCards, DeckStats } from "../../types"
import { combineTextInputValidators, lengthLimitTextInputValidator, numbersLimitTextInputValidator, numbersOnlyTextInputValidator, omitFromPartialRecord, toUniqueArray } from "../../utilities/general"
import { CardArtWindow } from "./CardArtWindow"
import { useBooleanState } from "../../hooks/useBooleanState"
import { IconButton } from "../../components/IconButton"

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

    const moveSelectedCardsToBoard = (board: Board, moveMode: 'all' | 'one') => {
        const newDeckCards = { ...deckCards }
        const newSelectedCards = { ...selectedCards }

        Object.keys(selectedCards).forEach((cardName) => {
            const currentBoard = selectedCards[cardName]
            const quantity = (newDeckCards[cardName].boards[currentBoard] ?? 0)
            // If quantityToMove is non-zero, that many copies are moved, otherwise all copies are moved
            const quantityBeingMoved = moveMode === 'all' ? quantity : 1
            const newQuantity = quantity - quantityBeingMoved
            if (newQuantity === 0) {
                delete newDeckCards[cardName].boards[currentBoard]
                delete newSelectedCards[cardName]
            } else {
                newDeckCards[cardName].boards[currentBoard] = newQuantity
            }
            newDeckCards[cardName].boards[board] = (newDeckCards[cardName].boards[board] ?? 0) + quantityBeingMoved
        })

        setDeckCards(newDeckCards)
        // If move all copies to board, deselect cards
        setSelectedCards(moveMode === 'all' ? {} : newSelectedCards)
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
                newDeckCards[cardName].categories = toUniqueArray([...newDeckCards[cardName].categories, category])
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


    return <div className="flex-row flex-gap flex-wrap align-end base-padding-vertical multi-select-bar">
        {/* <div className="flex-row flex-gap align-end"> */}
        <TextInput type={'search'} label={'Add category'} value={categoryUpdateText} onChangeText={setCategoryUpdateText} validator={lengthLimitTextInputValidator(30)} />
        <TextInput type={'search'} label={'Quantity'} value={quantityUpdateText} onChangeText={setQuantityUpdateText} validator={combineTextInputValidators(numbersOnlyTextInputValidator, numbersLimitTextInputValidator(99))} />
        {/* <button onClick={updateSelectedCards} disabled={!categoryUpdateText.trim() && !quantityUpdateText}>Update cards</button> */}
        <IconButton iconName={"check"} onClick={updateSelectedCards} disabled={!categoryUpdateText.trim() && !quantityUpdateText}>Update cards</IconButton>
        <IconButton iconName={"reset_shutter_speed"} onClick={removeSelectedCardsCategories}>Remove categories</IconButton>
        <IconButton iconName={"delete"} onClick={removeSelectedCards}>Remove cards</IconButton>
        <IconButton iconName={"brush"} onClick={showCardArtWindow} disabled={Object.keys(selectedCards).length > 150}>Change card art</IconButton>
        {/* </div> */}
        {/* <div className="flex-row flex-gap"> */}
        <div className="flex-row">
            <IconButton iconName={"move_up"} onClick={() => moveSelectedCardsToBoard('mainboard', 'all')}>Move all copies to Main Deck</IconButton>
            <IconButton iconName={"exposure_plus_1"} onClick={() => moveSelectedCardsToBoard('mainboard', 'one')}>Move 1 copy to Main Deck</IconButton>
        </div>
        <div className="flex-row">
            <IconButton iconName={"move_down"} onClick={() => moveSelectedCardsToBoard('sideboard', 'all')}>Move all copies to Sideboard</IconButton>
            <IconButton iconName={"exposure_plus_1"} onClick={() => moveSelectedCardsToBoard('sideboard', 'one')}>Move 1 copy to Sideboard</IconButton>
        </div>
        <div className="flex-row">
            <IconButton iconName={"indeterminate_question_box"} onClick={() => moveSelectedCardsToBoard('considering', 'all')}>Move all copies to Considering</IconButton>
            <IconButton iconName={"exposure_plus_1"} onClick={() => moveSelectedCardsToBoard('considering', 'one')}>Move 1 copy to Considering</IconButton>
        </div>
        <IconButton iconName={"close"} onClick={deselectAllCards}>Deselect cards</IconButton>
        {/* </div> */}
        {cardArtWindowVisible && <CardArtWindow back={hideCardArtWindow} save={saveArtChanges} selectedCards={selectedCards} deckCards={deckCards} />}
    </div>
}
