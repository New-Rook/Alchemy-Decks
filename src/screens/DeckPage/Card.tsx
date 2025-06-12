import { Board, CategoryUpdateOperation, DeckCard, Format, ViewType } from "../../types"
import { AppContext } from "../../context/AppContext"
import { getCardFrontImage } from "../../utilities/card"
import { useDraggable } from "@dnd-kit/core"
import { CARD_GROUP_STACKED_OFFSET_STYLE, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from "../../data/editor"
// import { CSS } from "@dnd-kit/utilities"
import './Card.css'
import React from "react"
import { IconButton } from "../../components/IconButton"

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
    viewType: ViewType
    index: number
    format: Format
    isCommander?: boolean
}

const SLIDE_BACK_STYLE = {
    transition: 'transform 0.25s'
}

const getViewStyle = (viewType: ViewType, index: number): React.HTMLAttributes<HTMLDivElement>['style'] => {
    if (viewType === 'stacked') {
        // return {
        //     translate: `0 calc(-10 * ${index} * var(--base-size))`,
        //     zIndex: index + 1
        // }
        return {
            position: 'absolute',
            top: `calc(${index} * ${CARD_GROUP_STACKED_OFFSET_STYLE})`,
            zIndex: index + 1,
            width: '100%',
            transition: `top ${index * 0.1}s`,
        }
    }

    return { top: 0, transition: `top ${index * 0.1}s` }
}

export const Card = ({
    groupName,
    cardName,
    deckCard,
    addDeckCardQuantity,
    enableDragAndDrop,
    selected,
    selectCard,
    board,
    legalityWarning,
    viewType,
    index,
    format,
    isCommander
}: Props) => {
    const { cardDictionary } = React.useContext(AppContext)

    const { attributes, listeners, setNodeRef, transform, isDragging, node, over } = useDraggable({
        id: `${cardName}${DRAG_AND_DROP_ID_DELIMITER}${groupName}`, disabled: !enableDragAndDrop
    });

    const [flipped, setFlipped] = React.useState(false)
    const [isPendingHoveringState, setIsPendingHoveringState] = React.useState(false)
    const [isHoveringImage, setIsHoveringImage] = React.useState(false)
    const [isHoveringCard, setIsHoveringCard] = React.useState(false)
    const [windowHalvesPosition, setWindowHalvesPosition] = React.useState({ right: false, bottom: false })

    const numberOfCopies = deckCard.boards[board]

    const isCommanderAndSingleCopy = React.useMemo(() => {
        return format === 'commander' && numberOfCopies === 1
    }, [format, numberOfCopies])

    React.useEffect(() => {
        if (!isPendingHoveringState || isDragging) {
            setIsHoveringImage(false)
            return
        }

        const timeoutID = setTimeout(() => {
            setIsHoveringImage(true)
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

    const cardClassName = React.useMemo(() => {
        return `deck-card 
            ${isDragging || isHoveringImage ? 'card-elevated' : ''} 
            ${selected ? 'deck-card-selected' : legalityWarning
                ? 'deck-card-warning' : ''
            } 
            preserve-3d`
    }, [isDragging, isHoveringImage, legalityWarning, selected])

    const expandedCardClassName = React.useMemo(() => {
        if (!isHoveringImage || isDragging) {
            return ''
        }

        return 'expanded-card-active ' + (windowHalvesPosition.right ? 'expanded-card-active-right' : 'expanded-card-active-left')
    }, [isHoveringImage, isDragging, windowHalvesPosition])

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
        <div onClick={() => selectCard(cardName, board)}
            className={cardClassName}
            key={cardName}
            ref={setNodeRef}
            style={{ ...style, ...getViewStyle(viewType, index) }}
            onMouseEnter={isCommanderAndSingleCopy ? () => setIsHoveringCard(true) : undefined}
            onMouseLeave={isCommanderAndSingleCopy ? () => setIsHoveringCard(false) : undefined}
            {...listeners} {...attributes}>
            {/* Top left */}
            <div className={cardDictionary[cardName].card_faces ? 'deck-flip-card-top-left-container' : 'deck-card-top-left-container'} style={{ zIndex: 3 }} onPointerDown={selected ? (e) => e.stopPropagation() : undefined}>
                {cardDictionary[cardName].card_faces && <IconButton iconName="cached" className='card-flip-button' onClick={flipCard} onPointerDown={(e) => e.stopPropagation()} />}
            </div>

            {/* Main image + categories */}
            <div className='flex-row deck-card-image'>
                {isDragging && <div style={{ position: 'absolute', backgroundColor: 'white' }} className={`flex-row flex-gap overflow-wrap ${windowHalvesPosition.right ? 'card-data-left' : 'card-data-right'}`}>{deckCard.categories?.map(category =>
                    <p key={category} style={{ color: dragData?.operation === 'overwrite' && category !== dragData.category ? 'red' : undefined }}>{category}</p>
                )}
                    {(dragData?.operation === 'add' || !dragData?.containsCategory) && dragData?.category !== NO_CATEGORY_NAME && <p style={{ color: 'green' }}>{dragData?.category}</p>}
                </div>}
                <img src={imageSource} className='deck-card-image' onMouseEnter={() => setIsPendingHoveringState(true)} onMouseLeave={() => setIsPendingHoveringState(false)} draggable={false} />
            </div>

            {/* Expanded card */}
            <div className={`flex-column expanded-card ${expandedCardClassName}`}>
                {isHoveringImage && <div className={`flex-column ${windowHalvesPosition.bottom ? 'card-data-top' : 'card-data-bottom'}`} style={{ position: 'absolute', backgroundColor: 'white' }}>
                    {deckCard.categories && <div className="flex-row flex-gap overflow-wrap">{deckCard.categories.map(category => <p key={category}>{category}</p>)}</div>}
                    <div className="text-danger">{legalityWarning}</div>
                </div>}
                <img src={imageSource} className={`deck-card-image`} draggable={false} />
            </div>

            {/* Top right */}
            {((!isCommanderAndSingleCopy || isHoveringCard) && !isCommander) && <div className='card-count-container flex-column' style={{ zIndex: 3 }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div className='card-count'>x{numberOfCopies}</div>
                <div className='flex-row'>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1, board)}>-</button>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1, board)}>+</button>
                </div>
            </div>}
        </div >
    )
}