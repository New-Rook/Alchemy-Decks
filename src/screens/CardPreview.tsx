import { Board, CategoryUpdateOperation, DeckCard } from "../types"
import { AppContext } from "../context/AppContext"
import { getCardFrontImage } from "../utilities/card"
import { useDraggable } from "@dnd-kit/core"
import { DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from "../data/editor"
import './DeckPage/Card.css'
import React from "react"

type Props = {
    cardName: string
    deckCard?: DeckCard
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
}

export const CardPreview = ({ cardName, deckCard, addDeckCardQuantity }: Props) => {
    const { cardDictionary } = React.useContext(AppContext)

    const [flipped, setFlipped] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)

    const flipCard = (e: React.MouseEvent<HTMLButtonElement>) => {
        setFlipped(!flipped)
        e.stopPropagation()
    }

    const imageSource = React.useMemo(() => {
        if (cardDictionary[cardName].card_faces && flipped) {
            return deckCard?.print?.uris[1] ?? cardDictionary[cardName].card_faces[1].image_uris.normal
        }

        return deckCard?.print?.uris[0] ?? getCardFrontImage(cardDictionary[cardName]).normal
    }, [cardDictionary, cardName, flipped, deckCard])

    const expandedCardClassName = React.useMemo(() => {
        if (!isHovering) {
            return ''
        }

        return 'expanded-card-active'
    }, [isHovering])

    return (
        <div className={`deck-card ${isHovering ? 'card-elevated' : ''}`} key={cardName}>
            <div className={cardDictionary[cardName].card_faces ? 'deck-flip-card-top-left-container' : 'deck-card-top-left-container'}>
                {cardDictionary[cardName].card_faces && <button className='card-flip-button' onClick={flipCard} onPointerDown={(e) => e.stopPropagation()}>Flip</button>}
            </div>
            <div className='flex-row deck-card-image'>
                <img src={imageSource} className='deck-card-image' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} draggable={false} />
            </div>
            <div className={`flex-column expanded-card ${expandedCardClassName} ${isHovering ? 'expanded-card-active' : ''}`}>
                <img src={imageSource} className={`deck-card-image`} draggable={false} />
            </div>
            <div className='card-count-container flex-column' style={{ zIndex: 3 }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {deckCard && <div className='card-count'>x{deckCard.boards.mainboard}</div>}
                <div className='flex-row'>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1, 'mainboard')}>-</button>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1, 'mainboard')}>+</button>
                </div>
            </div>
        </div >
    )
}