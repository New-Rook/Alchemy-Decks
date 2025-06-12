import React from "react"
import { Board, DeckCards, Format, ViewType } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { CARD_GROUP_STACKED_OFFSET_STYLE, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from "../../data/editor"
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
    const { isOver: isOverAdd, setNodeRef: setAddNodeRef, active } = useDroppable({ id: `${groupName}${DRAG_AND_DROP_ID_DELIMITER}add`, disabled: !enableDragAndDrop })
    const { isOver: isOverOverwrite, setNodeRef: setOverwriteNodeRef } = useDroppable({ id: `${groupName}${DRAG_AND_DROP_ID_DELIMITER}overwrite`, disabled: !enableDragAndDrop })

    const [isHovering, setIsHovering] = React.useState(false)

    const numberOfCards = React.useMemo(() => {
        return cardNames.reduce((total, cardName) => total + (deckCards[cardName].boards[board] ?? 0), 0)
    }, [cardNames, deckCards])

    const draggedCard = React.useMemo(() => {
        if (!enableDragAndDrop || !active) {
            return { isNotFromThisGroup: false, hasThisGroupCategory: false }
        }

        const cardDragIDSplit = active.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
        const draggedCardName = cardDragIDSplit[0]
        const cardCurrentCategory = cardDragIDSplit[1]

        return {
            isNotFromThisGroup: cardCurrentCategory !== groupName,
            hasThisGroupCategory: deckCards[draggedCardName].categories?.includes(groupName),
            hasCategory: !!deckCards[draggedCardName].categories
        }
    }, [groupName, enableDragAndDrop, active, deckCards])

    const getDraggedClassName = (operation: string) => {
        if (!draggedCard.isNotFromThisGroup) {
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
        if (groupName === NO_CATEGORY_NAME || draggedCard.hasThisGroupCategory) {
            return DRAG_AND_DROP_OVERWRITE_OPERATION_NAME
        }

        if (!draggedCard.hasCategory) {
            return DRAG_AND_DROP_ADD_OPERATION_NAME
        }

        return 'both'
    }, [groupName, draggedCard.hasThisGroupCategory, draggedCard.hasCategory])

    return (
        <div className={`card-group flex-column flex-gap-small position-relative ${isHovering ? 'group-elevated' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <span className="card-group-title flex-row flex-gap-small align-center">{groupLabel} ({numberOfCards})</span>
            <div className={`position-relative ${cardGroupStyleMap[viewType]}`} style={getCardGroupViewStyle(viewType, cardNames.length)}>
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
                        index={index}
                        format={format}
                    />
                )}
                {
                    <div className="flex-row category-drop-container">
                        {(dropSections === 'add' || dropSections === 'both') && <div className={`flex-row flex-center category-drop-section ${dropSections === 'add' ? 'category-drop-section-full-size' : 'category-drop-section'} ${getDraggedClassName('add')}`}
                            ref={setAddNodeRef}>
                            {draggedCard.isNotFromThisGroup && isOverAdd && <div className="category-drop-add-title flex-row"><Icon name={"add"} /></div>}
                        </div>}
                        {(dropSections === 'overwrite' || dropSections === 'both') && <div className={`flex-row flex-center ${dropSections === 'overwrite' ? 'category-drop-section-full-size' : 'category-drop-section'} ${getDraggedClassName('overwrite')}`}
                            ref={setOverwriteNodeRef}>
                            {draggedCard.isNotFromThisGroup && isOverOverwrite && <div className="category-drop-overwrite-title flex-row"><Icon name={"flip"} /></div>}
                        </div>}
                    </div>
                }
            </div>
        </div>
    )
}