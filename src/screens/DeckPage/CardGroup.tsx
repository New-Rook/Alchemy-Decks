import React from "react"
import { Board, CategoryUpdateOperation, DeckCards, Format, ViewType } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { CARD_GROUP_STACKED_OFFSET_STYLE, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_REGEX } from "../../data/editor"
import { cardGroupStyleMap, getCardGroupViewStyle } from "../../styling/editor"
import { Icon } from "../../components/Icon"

type Props = {
    groupName: string
    groupLabel: React.ReactNode
    cardNames: string[]
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
    enableDragAndDrop: boolean
    selectedCards: Record<string, Board>
    selectCard: (cardName: string, board: Board) => void
    board: Board
    legalityWarnings: Record<string, string>
    viewType: ViewType
    format: Format
}

export const CardGroup = ({
    groupName,
    groupLabel,
    cardNames,
    deckCards,
    addDeckCardQuantity,
    enableDragAndDrop,
    selectedCards,
    selectCard,
    board,
    legalityWarnings,
    viewType,
    format
}: Props) => {
    const { active } = useDroppable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${groupName}`
    })

    const draggedCard = React.useMemo(() => {
        if (!enableDragAndDrop || !active || !active.data.current) {
            return { isFromThisBoard: false, isFromThisGroup: false, hasThisGroupCategory: false, hasCategory: false }
        }

        const draggedCardName = active.data.current.cardName
        const cardCurrentCategory = active.data.current.groupName
        const cardCurrentBoard = active.data.current.board

        return {
            isFromThisBoard: cardCurrentBoard === board,
            isFromThisGroup: cardCurrentCategory === groupName,
            hasThisGroupCategory: deckCards[draggedCardName].categories?.includes(groupName),
            hasCategory: !!deckCards[draggedCardName].categories
        }
    }, [groupName, enableDragAndDrop, active, deckCards, board])

    const { isOver: isOverAdd, setNodeRef: setAddNodeRef } = useDroppable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${groupName}${DRAG_AND_DROP_ID_DELIMITER}add`,
        disabled: !enableDragAndDrop || !draggedCard.isFromThisBoard,
        data: { board, groupName, operation: DRAG_AND_DROP_ADD_OPERATION_NAME }
    })
    const { isOver: isOverOverwrite, setNodeRef: setOverwriteNodeRef } = useDroppable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${groupName}${DRAG_AND_DROP_ID_DELIMITER}overwrite`,
        disabled: !enableDragAndDrop || !draggedCard.isFromThisBoard,
        data: { board, groupName, operation: DRAG_AND_DROP_OVERWRITE_OPERATION_NAME }
    })

    const [isHovering, setIsHovering] = React.useState(false)
    const [fullyShownCardName, setFullyShownCardName] = React.useState('')

    const numberOfCards = React.useMemo(() => {
        return cardNames.reduce((total, cardName) => total + (deckCards[cardName].boards[board] ?? 0), 0)
    }, [cardNames, deckCards])

    const getDraggedClassName = (operation: CategoryUpdateOperation) => {
        if (draggedCard.isFromThisGroup) {
            return ''
        }

        if (operation === DRAG_AND_DROP_ADD_OPERATION_NAME) {
            if (isOverAdd) {
                return 'category-drop-add-hover'
            }
            if (isOverOverwrite) {
                return 'category-drop-add'
            }
        }

        if (operation === DRAG_AND_DROP_OVERWRITE_OPERATION_NAME) {
            if (isOverOverwrite) {
                return 'category-drop-overwrite-hover'
            }
            if (isOverAdd) {
                return 'category-drop-overwrite'
            }
        }

        return ''
    }

    const dropSections = React.useMemo(() => {
        if (NO_CATEGORY_REGEX.test(groupName) || draggedCard.hasThisGroupCategory) {
            return DRAG_AND_DROP_OVERWRITE_OPERATION_NAME
        }

        if (!draggedCard.hasCategory) {
            return DRAG_AND_DROP_ADD_OPERATION_NAME
        }

        return 'both'
    }, [groupName, draggedCard.hasThisGroupCategory, draggedCard.hasCategory])

    const showFullCard = React.useCallback((cardName: string) => {
        // if (fullyShownCardName === cardName) {
        //     selectCard(cardName, board)
        // } else {
        // console.log('show', cardName)
        setFullyShownCardName(cardName)
        // }
    }, [])

    // const hideFullCard = React.useCallback(() => {
    //     setFullyShownCardName('')
    // }, [])

    // const selectCardMap = React.useMemo<Record<ViewType, (cardName: string, board: Board) => void>>(() => ({
    //     text: selectCard,
    //     grid: selectCard,
    //     stacked: showFullCard,
    //     'grid-stacked': showFullCard
    // }), [selectCard, showFullCard])

    const fullyShownCardIndex = React.useMemo(() => {
        const indexFound = cardNames.indexOf(fullyShownCardName)
        return indexFound > -1 ? indexFound : undefined
    }, [cardNames, fullyShownCardName])

    return (
        <div className={`card-group flex-column flex-gap-small position-relative ${isHovering ? 'group-elevated' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <div className="card-group-title flex-row flex-gap-small align-center">
                <span className="flex-row flex-center">{groupLabel}</span>
                <span className="group-card-count">({numberOfCards})</span>
            </div>
            <div className={`position-relative ${cardGroupStyleMap[viewType]}`} style={getCardGroupViewStyle(viewType, cardNames.length, fullyShownCardIndex)}>
                {cardNames.map((cardName, index) =>
                    <Card
                        key={cardName}
                        groupName={groupName}
                        cardName={cardName}
                        deckCard={deckCards[cardName]}
                        addDeckCardQuantity={addDeckCardQuantity}
                        enableDragAndDrop={enableDragAndDrop}
                        selectCard={selectCard}
                        selected={selectedCards[cardName] === board}
                        board={board}
                        legalityWarning={legalityWarnings[cardName]}
                        viewType={viewType}
                        index={fullyShownCardIndex !== undefined && index > fullyShownCardIndex ? index + 6 : index}
                        format={format}
                        showFullCard={showFullCard}
                    />
                )}
                {
                    <div className="flex-row category-drop-container">
                        {(dropSections === 'add' || dropSections === 'both') && <div className={`flex-row flex-center ${dropSections === 'add' ? 'category-drop-section-full-size' : 'category-drop-section'} ${getDraggedClassName(DRAG_AND_DROP_ADD_OPERATION_NAME)}`}
                            ref={setAddNodeRef}>
                            {!draggedCard.isFromThisGroup && isOverAdd && <div className="category-drop-add-title flex-row"><Icon name={"add"} /></div>}
                        </div>}
                        {(dropSections === 'overwrite' || dropSections === 'both') && <div className={`flex-row flex-center ${dropSections === 'overwrite' ? 'category-drop-section-full-size' : 'category-drop-section'} ${getDraggedClassName(DRAG_AND_DROP_OVERWRITE_OPERATION_NAME)}`}
                            ref={setOverwriteNodeRef}>
                            {!draggedCard.isFromThisGroup && isOverOverwrite && <div className="category-drop-overwrite-title flex-row"><Icon name={"flip"} /></div>}
                        </div>}
                    </div>
                }
            </div>
        </div>
    )
}