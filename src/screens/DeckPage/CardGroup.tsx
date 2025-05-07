import React from "react"
import { DeckCards } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, NO_CATEGORY_NAME } from "../../data/editor"

type Props = {
    groupName: string
    groupLabel: React.ReactNode
    cardNames: string[]
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number) => void
    enableDragAndDrop: boolean
}

export const CardGroup = ({ groupName, groupLabel, cardNames, deckCards, addDeckCardQuantity, enableDragAndDrop }: Props) => {
    const { isOver: isOverAdd, setNodeRef: setAddNodeRef, active } = useDroppable({ id: `${groupName}${DRAG_AND_DROP_ID_DELIMITER}add`, disabled: !enableDragAndDrop })
    const { isOver: isOverOverwrite, setNodeRef: setOverwriteNodeRef } = useDroppable({ id: `${groupName}${DRAG_AND_DROP_ID_DELIMITER}overwrite`, disabled: !enableDragAndDrop })

    // if (groupName === '1') {
    //     console.log('me 1', isOver)
    // }

    const numberOfCards = React.useMemo(() => {
        return cardNames.reduce((total, cardName) => total + deckCards[cardName].quantity, 0)
    }, [cardNames, deckCards])

    const draggedCardIsNotFromThisGroup = React.useMemo(() => {
        if (!enableDragAndDrop || !active) {
            return
        }

        const cardDragIDSplit = active.id.toString().split(DRAG_AND_DROP_ID_DELIMITER)
        const cardCurrentCategory = cardDragIDSplit[1]

        return cardCurrentCategory !== groupName
    }, [enableDragAndDrop, active])

    // console.log({ isOverAdd, isOverOverwrite })
    // console.log('active', active)
    // console.log('over', over)
    // console.log('cardIsFromThisGroup', cardIsFromThisGroup)

    const getDraggedClassName = (operation: string) => {
        if (!draggedCardIsNotFromThisGroup) {
            return ''
        }

        if (operation === DRAG_AND_DROP_ADD_OPERATION_NAME) {
            if (isOverAdd) {
                return ' category-drop-add-hover'
            }
            if (isOverOverwrite) {
                return ' category-drop-add'
            }
        }

        if (operation === DRAG_AND_DROP_OVERWRITE_OPERATION_NAME) {
            if (isOverOverwrite) {
                return ' category-drop-overwrite-hover'
            }
            if (isOverAdd) {
                return ' category-drop-overwrite'
            }
        }

        return ''
    }

    return (
        <div className="flex-column" style={{ position: 'relative' }}>
            {groupLabel} ({numberOfCards})
            <div className="card-group">
                {cardNames.map(cardName =>
                    <Card
                        key={cardName}
                        groupName={groupName}
                        cardName={cardName}
                        deckCard={deckCards[cardName]}
                        addDeckCardQuantity={addDeckCardQuantity}
                        enableDragAndDrop={enableDragAndDrop}
                    />
                )}
            </div>
            {
                <div className="flex-row category-drop-container">
                    {groupName !== NO_CATEGORY_NAME && <div className={`flex-row flex-center category-drop-section${getDraggedClassName('add')}`}
                        ref={setAddNodeRef}>
                        {draggedCardIsNotFromThisGroup && isOverAdd && <div className="category-drop-add-title">Add</div>}
                    </div>}
                    <div className={`flex-row flex-center ${groupName === NO_CATEGORY_NAME ? 'category-drop-section-full-size' : 'category-drop-section'}${getDraggedClassName('overwrite')}`}
                        ref={setOverwriteNodeRef}>
                        {draggedCardIsNotFromThisGroup && isOverOverwrite && <div className="category-drop-overwrite-title">Overwrite</div>}
                    </div>
                </div>}
        </div>
    )
}