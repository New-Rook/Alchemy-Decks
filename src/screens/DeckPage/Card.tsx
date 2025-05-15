import { Board, CategoryUpdateOperation, DeckCard } from "../../types"
import { AppContext } from "../../context/AppContext"
import { getCardFrontImage } from "../../utilities/card"
import { useDraggable } from "@dnd-kit/core"
import { DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from "../../data/editor"
// import { CSS } from "@dnd-kit/utilities"
import './Card.css'
import React from "react"

type Props = {
    groupName: string
    cardName: string
    deckCard: DeckCard
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
    enableDragAndDrop: boolean
    selected: boolean
    selectCard: (cardName: string, board: Board) => void
    board: Board
    legalityWarning: string
}

const SLIDE_BACK_STYLE = {
    transition: 'transform 0.25s'
}

export const Card = ({ groupName, cardName, deckCard, addDeckCardQuantity, enableDragAndDrop, selected, selectCard, board, legalityWarning }: Props) => {
    const { cardDictionary } = React.useContext(AppContext)

    const { attributes, listeners, setNodeRef, transform, isDragging, node, over } = useDraggable({
        id: `${cardName}${DRAG_AND_DROP_ID_DELIMITER}${groupName}`, disabled: !enableDragAndDrop
    });

    const [flipped, setFlipped] = React.useState(false)
    const [isPendingHoveringState, setIsPendingHoveringState] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)
    const [windowHalvesPosition, setWindowHalvesPosition] = React.useState({ right: false, bottom: false })

    React.useEffect(() => {
        if (!isPendingHoveringState || isDragging) {
            setIsHovering(false)
            return
        }

        const timeoutID = setTimeout(() => {
            setIsHovering(true)
            if (node.current) {
                const rect = node.current.getBoundingClientRect()
                const isOnRightHalf = rect.left > window.innerWidth / 2
                const isOnBottomHalf = rect.top > window.innerHeight / 2
                setWindowHalvesPosition({ right: isOnRightHalf, bottom: isOnBottomHalf })
            }
        }, 250)
        return () => clearTimeout(timeoutID)
    }, [isPendingHoveringState, isDragging, selected])

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : SLIDE_BACK_STYLE

    const flipCard = (e: React.MouseEvent<HTMLButtonElement>) => {
        setFlipped(!flipped)
        e.stopPropagation()
    }

    const imageSource = React.useMemo(() => {
        if (cardDictionary[cardName].card_faces && flipped) {
            return deckCard.print?.uris[1] ?? cardDictionary[cardName].card_faces[1].image_uris.normal
        }

        return deckCard.print?.uris[0] ?? getCardFrontImage(cardDictionary[cardName]).normal
    }, [cardDictionary, cardName, flipped, deckCard])

    const expandedCardClassName = React.useMemo(() => {
        if (!isHovering || isDragging) {
            return ''
        }

        return 'expanded-card-active ' + (windowHalvesPosition.right ? 'expanded-card-active-right' : 'expanded-card-active-left')
    }, [isHovering, isDragging, windowHalvesPosition])

    const dragData = React.useMemo(() => {
        if (!isDragging) {
            return null
        }

        if (over) {
            const categoryDropIDSplit = over.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
            const overCategoryName = categoryDropIDSplit[0]
            const overCategoryOperation = groupName === NO_CATEGORY_NAME ? DRAG_AND_DROP_OVERWRITE_OPERATION_NAME : categoryDropIDSplit[1]
            if (overCategoryName !== groupName) {
                return {
                    category: overCategoryName,
                    operation: overCategoryOperation as CategoryUpdateOperation,
                    containsCategory: deckCard.categories?.includes(overCategoryName)
                }
            }
        }

        return null
    }, [isDragging, over])

    return (
        <div onClick={() => selectCard(cardName, board)} className={`deck-card`} key={cardName} ref={setNodeRef} style={{ ...style, zIndex: isDragging || isHovering ? 2 : undefined, transformStyle: 'preserve-3d', backgroundColor: legalityWarning ? 'red' : undefined }}  {...listeners} {...attributes}>
            {/* <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' onMouseEnter={() => setIsPendingHoveringState(true)} onMouseLeave={() => setIsPendingHoveringState(false)}
                style={{ rotate: flipped ? 'y 180deg' : 'y 0deg', transition: 'rotate 0.5s' }} draggable={false} /> */}
            {/* {cardDictionary[cardName].card_faces && <img src={cardDictionary[cardName].card_faces[1].image_uris.normal} className='deck-card-image' style={{ position: 'absolute', left: 0, rotate: flipped ? 'y 0deg' : 'y 180deg', transition: 'rotate 0.5s', translate: '0 0 -100px' }} draggable={false} />} */}
            <div className='deck-card-selected' style={{ zIndex: 3 }} onPointerDown={selected ? (e) => e.stopPropagation() : undefined}>
                {selected && <input className='deck-card-selected-icon' type="checkbox" checked readOnly />}
                {cardDictionary[cardName].card_faces && <button className='card-flip-button' onClick={flipCard} onPointerDown={(e) => e.stopPropagation()}>Flip</button>}
            </div>

            {/* <div className={`deck-card`} key={cardName}
            {...(enableDragAndDrop ? { ref: setNodeRef, style, ...listeners, ...attributes } : {})}> */}
            {/* {cardDictionary[cardName].card_faces && flipped ? <img src={cardDictionary[cardName].card_faces[1].image_uris.normal} className='deck-card-image' draggable={false} /> : <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' draggable={false} />} */}
            {/* {cardDictionary[cardName].card_faces && flipped ? <img src={cardDictionary[cardName].card_faces[1].image_uris.normal} className='deck-card-image' draggable={false} /> : <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' onMouseEnter={() => setIsPendingHoveringState(true)} onMouseLeave={() => setIsPendingHoveringState(false)}
                style={{ rotate: flipped ? 'y 180deg' : 'y 0deg', transition: 'rotate 0.5s' }} draggable={false} />} */}
            {/* {<img src={cardDictionary[cardName].card_faces && flipped ? cardDictionary[cardName].card_faces[1].image_uris.normal : getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' draggable={false} />} */}
            <div className='flex-row deck-card-image'>
                {isDragging && <div style={{ position: 'absolute', backgroundColor: 'white' }} className={`flex-row flex-gap overflow-wrap ${windowHalvesPosition.right ? 'card-data-left' : 'card-data-right'}`}>{deckCard.categories?.map(category =>
                    <p style={{ color: dragData?.operation === 'overwrite' && category !== dragData.category ? 'red' : undefined }}>{category}</p>
                )}
                    {(dragData?.operation === 'add' || !dragData?.containsCategory) && dragData?.category !== NO_CATEGORY_NAME && <p style={{ color: 'green' }}>{dragData?.category}</p>}
                </div>}
                <img src={imageSource} className='deck-card-image' onMouseEnter={() => setIsPendingHoveringState(true)} onMouseLeave={() => setIsPendingHoveringState(false)} draggable={false} />
            </div>
            {/* <img src={imageSource} className={`deck-card-image expanded-card ${expandedCardClassName}`} draggable={false} /> */}
            <div className={`flex-column expanded-card ${expandedCardClassName}`}>
                {/* {!windowHalvesPosition.bottom && <img src={imageSource} className={`deck-card-image`} draggable={false} />} */}
                {isHovering && <div className={`flex-column ${windowHalvesPosition.bottom ? 'card-data-top' : 'card-data-bottom'}`} style={{ position: 'absolute', backgroundColor: 'white' }}>
                    {deckCard.categories && <div className="flex-row flex-gap overflow-wrap">{deckCard.categories.map(category => <p key={category}>{category}</p>)}</div>}
                    <div style={{ color: 'red' }}>{legalityWarning}</div>
                </div>}
                {/* {windowHalvesPosition.bottom && <img src={imageSource} className={`deck-card-image`} draggable={false} />} */}
                <img src={imageSource} className={`deck-card-image`} draggable={false} />
            </div>
            <div className='card-count-container flex-column' style={{ zIndex: 3 }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div className='card-count'>x{deckCard.boards[board]}</div>
                <div className='flex-row'>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1, board)}>-</button>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1, board)}>+</button>
                </div>
            </div>
        </div >
    )
}