import { useContext } from "react"
import { DeckCard } from "../../types"
import { AppContext } from "../../context/AppContext"
import { getCardImages } from "../../utilities/card"
import { useDraggable } from "@dnd-kit/core"
import { DRAG_AND_DROP_ID_DELIMITER } from "../../data/editor"
// import { CSS } from "@dnd-kit/utilities"

type Props = {
    groupName: string
    cardName: string
    deckCard: DeckCard
    addDeckCardQuantity: (cardName: string, quantity: number) => void
    enableDragAndDrop: boolean
    selected: boolean
    selectCard: (cardName: string) => void
}

const SLIDE_BACK_STYLE = {
    transition: 'transform 0.25s'
}

export const Card = ({ groupName, cardName, deckCard, addDeckCardQuantity, enableDragAndDrop, selected, selectCard }: Props) => {
    const { cardDictionary } = useContext(AppContext)

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${cardName}${DRAG_AND_DROP_ID_DELIMITER}${groupName}`, disabled: !enableDragAndDrop
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : SLIDE_BACK_STYLE

    return (
        <div onClick={() => selectCard(cardName)} className={`deck-card`} key={cardName} ref={setNodeRef} style={{ ...style, zIndex: isDragging ? 2 : undefined }}  {...listeners} {...attributes}>
            {selected && <div className='deck-card-selected' onPointerDown={(e) => e.stopPropagation()}>
                <input className='deck-card-selected-icon' type="checkbox" checked readOnly />
            </div>}
            {/* <div className={`deck-card`} key={cardName}
            {...(enableDragAndDrop ? { ref: setNodeRef, style, ...listeners, ...attributes } : {})}> */}
            <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' draggable={false} />
            <div className='card-count-container flex-column' onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div className='card-count'>x{deckCard.quantity}</div>
                <div className='flex-row'>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1)}>-</button>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1)}>+</button>
                </div>
            </div>
        </div >
    )
}