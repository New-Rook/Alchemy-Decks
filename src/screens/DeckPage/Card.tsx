import { Board, CategoryUpdateOperation, DeckCard, Format, ViewType } from "../../types"
import { AppContext } from "../../context/AppContext"
import { getCardFrontImage } from "../../utilities/card"
import { useDraggable } from "@dnd-kit/core"
import { CARD_GROUP_STACKED_OFFSET_STYLE, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, INFINITE_QUANTITY_REGEX, LEGALITY_WARNING_NUMBER_OF_COPIES_REGEX, NO_CATEGORY_REGEX } from "../../data/editor"
// import { CSS } from "@dnd-kit/utilities"
import './Card.css'
import React from "react"
import { IconButton } from "../../components/IconButton"
import { Icon } from "../../components/Icon"

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
    showFullCard: (cardName: string) => void
}

const SLIDE_BACK_STYLE = {
    transition: 'transform 0.25s, top 0.5s'
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
            // transition: `top ${index * 0.1}s`,
        }
    }
    else if (viewType === 'text') {
        return {
            border: '2px solid black',
            padding: 'calc(0.5 * var(--base-size))'
        }
    }

    return { top: 0 }
}

export const Card = ({
    groupName,
    cardName,
    deckCard,
    addDeckCardQuantity,
    // enableDragAndDrop,
    selected,
    selectCard,
    board,
    legalityWarning,
    viewType,
    index,
    format,
    showFullCard
}: Props) => {
    const { cardDictionary } = React.useContext(AppContext)

    const { attributes, listeners, setNodeRef, transform, isDragging, node, over } = useDraggable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${groupName}${DRAG_AND_DROP_ID_DELIMITER}${cardName}`,
        // disabled: !enableDragAndDrop,
        data: { board, groupName, cardName }
    });

    const [flipped, setFlipped] = React.useState(false)
    const [isPendingHoveringState, setIsPendingHoveringState] = React.useState(false)
    const [isHoveringImage, setIsHoveringImage] = React.useState(false)
    const [isHoveringCard, setIsHoveringCard] = React.useState(false)
    const [windowHalvesPosition, setWindowHalvesPosition] = React.useState({ right: false, bottom: false })

    const numberOfCopies = deckCard.boards[board]

    const isCommanderFormatAndSingleCopy = React.useMemo(() => {
        return format === 'commander' && numberOfCopies === 1
    }, [format, numberOfCopies])

    const isCommanderAndInfiniteQuantity = React.useMemo(() => {
        return !!deckCard.commanderNumber && INFINITE_QUANTITY_REGEX.test(cardDictionary[cardName].oracle_text)
    }, [deckCard, cardDictionary])

    React.useEffect(() => {
        if (isDragging) {
            setIsPendingHoveringState(false)
            return
        }
        if (!isPendingHoveringState) {
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
    }, [isPendingHoveringState, isDragging])

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

    const showLegalityWarning = React.useMemo(() => {
        if (board === 'considering' && LEGALITY_WARNING_NUMBER_OF_COPIES_REGEX.test(legalityWarning)) {
            return false
        }

        return !!legalityWarning
    }, [board, legalityWarning])

    const cardClassName = React.useMemo(() => {
        return `deck-card 
            ${isDragging || isHoveringImage ? 'card-elevated' : ''} 
            ${selected ? 'deck-card-selected' : showLegalityWarning
                ? 'deck-card-warning' : ''
            } 
            preserve-3d`
    }, [isDragging, isHoveringImage, showLegalityWarning, selected])

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

        if (over && over.data.current) {
            const overCategoryName = over.data.current.groupName
            const overCategoryOperation = NO_CATEGORY_REGEX.test(groupName) ? DRAG_AND_DROP_OVERWRITE_OPERATION_NAME : over.data.current.operation
            const overBoard = over.data.current.board

            if (overBoard === board && overCategoryName !== groupName) {
                return {
                    category: overCategoryName,
                    operation: overCategoryOperation as CategoryUpdateOperation,
                    containsCategory: deckCard.categories?.includes(overCategoryName)
                }
            }
        }

        return null
    }, [isDragging, over, board, groupName, deckCard])

    const onHover = React.useCallback((isEntering: boolean) => {
        if ((viewType === 'stacked' || viewType === 'grid-stacked')) {
            showFullCard(isEntering ? cardName : '')
        }
        if (isCommanderFormatAndSingleCopy) {
            setIsHoveringCard(isEntering)
        }
        setIsPendingHoveringState(isEntering)
    }, [viewType, cardName, showFullCard, isCommanderFormatAndSingleCopy])

    return (
        <div onClick={() => selectCard(cardName, board)}
            className={cardClassName}
            key={cardName}
            ref={setNodeRef}
            style={{ ...style, ...getViewStyle(viewType, index) }}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            {...listeners} {...attributes}>
            {/* Top left */}
            <div className={`deck-card-data-elevated ${cardDictionary[cardName].card_faces ? 'deck-flip-card-top-left-container' : 'deck-card-top-left-container'}`} onPointerDown={selected ? (e) => e.stopPropagation() : undefined}>
                {cardDictionary[cardName].card_faces && <IconButton iconName="cached" className='card-flip-button' onClick={flipCard} onPointerDown={(e) => e.stopPropagation()} />}
            </div>

            {/* Main image + categories */}
            <div className='flex-row deck-card-image'>
                {isDragging && <div className={`deck-card-categories ${deckCard.categories || dragData?.category ? 'base-padding' : ''} font-size-1-5 flex-row flex-gap flex-wrap ${windowHalvesPosition.right ? 'card-data-left' : 'card-data-right'}`}>{deckCard.categories?.map(category =>
                    <span key={category} className={`${dragData?.operation === 'overwrite' && category !== dragData.category ? 'text-danger' : ''}`}>{category}</span>
                )}
                    {(dragData?.operation === 'add' || !dragData?.containsCategory) && !NO_CATEGORY_REGEX.test(dragData?.category) && dragData?.category && <span className="deck-card-category-add">{dragData.category}</span>}
                </div>}
                {viewType === 'text'
                    ? <label className="view-text-deck-card-name">{cardName}</label>
                    : <img src={imageSource}
                        className='deck-card-image'
                        //  onMouseEnter={() => setIsPendingHoveringState(true)}
                        //   onMouseLeave={() => setIsPendingHoveringState(false)} 
                        draggable={false}
                    />
                }
            </div>

            {/* Expanded card */}
            <div className={`flex-column expanded-card ${viewType === 'text' ? 'view-text-expanded-card' : ''} ${expandedCardClassName}`}>
                {isHoveringImage && !isDragging && (deckCard.categories || showLegalityWarning) && <div className={`deck-card-categories base-padding flex-column ${windowHalvesPosition.bottom ? 'card-data-top' : 'card-data-bottom'}`}>
                    {deckCard.categories && <div className="flex-row flex-gap flex-wrap">{deckCard.categories.map(category => <span key={category}>{category}</span>)}</div>}
                    {showLegalityWarning && <div className="text-danger">{legalityWarning}</div>}
                </div>}
                <img src={imageSource} className={`deck-card-image`} draggable={false} />
            </div>

            {/* Top right */}
            {((!isCommanderFormatAndSingleCopy || isHoveringCard) && (!deckCard.commanderNumber || isCommanderAndInfiniteQuantity)) && <div className='deck-card-data-elevated card-count-container flex-column' onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div className='card-count'>{numberOfCopies}</div>
                <div className='flex-row'>
                    <IconButton size={'tiny'} onClick={() => addDeckCardQuantity(cardName, -1, board)} iconName={"remove"} disabled={isCommanderAndInfiniteQuantity && numberOfCopies === 1} />
                    <IconButton size={'tiny'} onClick={() => addDeckCardQuantity(cardName, 1, board)} iconName={"add"} disabled={numberOfCopies === 99} />
                </div>
            </div>}
        </div >
    )
}