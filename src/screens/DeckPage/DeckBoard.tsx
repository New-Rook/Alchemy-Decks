import { PropsWithChildren } from "react"
import { Expandable, ExpandableProps } from "../../components/Expandable"
import { BOARD_DATA, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME, DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME } from "../../data/editor"
import { Board, BoardMoveOperation, ViewType } from "../../types"
import { boardStyleMap } from "../../styling/editor"
import { useDroppable } from "@dnd-kit/core"
import React from "react"
import { ExpandableBoard } from "./ExpandableBoard"
import { Icon } from "../../components/Icon"
import './CardGroup.css'

interface Props extends PropsWithChildren {
    board: Board
    ref: React.Ref<HTMLDivElement>
    viewType: ViewType
    isEssentialBoard: boolean
    handleCardDropFromOutside: (e: React.DragEvent<HTMLDivElement>, board: Board) => void
}

export const DeckBoard = ({ board, ref, viewType, isEssentialBoard, handleCardDropFromOutside, children, ...props }: Props) => {
    const { isOver: isOverMoveOne, setNodeRef: setMoveOneNodeRef, active } = useDroppable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME}`,
        data: { board, operation: DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME }
    })
    const { isOver: isOverMoveAll, setNodeRef: setMoveAllNodeRef } = useDroppable({
        id: `${board}${DRAG_AND_DROP_ID_DELIMITER}${DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME}`,
        data: { board, operation: DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME }
    })

    const draggedCardIsFromDifferentBoard = React.useMemo(() => {
        if (!active || !active.data.current) {
            return
        }

        const cardCurrentBoard = active.data.current.board
        return cardCurrentBoard !== board
    }, [active, board])

    const getDraggedClassName = (operation: BoardMoveOperation) => {
        if (operation === DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME) {
            if (isOverMoveOne) {
                return 'category-drop-add-hover'
            }
            if (isOverMoveAll) {
                return 'category-drop-add'
            }
        }

        if (operation === DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME) {
            if (isOverMoveAll) {
                return 'category-drop-overwrite-hover'
            }
            if (isOverMoveOne) {
                return 'category-drop-overwrite'
            }
        }

        return ''
    }

    return <ExpandableBoard board={board} {...props}>
        <div
            ref={ref}
            className={`board ${isEssentialBoard ? 'essential-board' : ''} ${active && !draggedCardIsFromDifferentBoard ? 'board-drag-container' : ''} ${boardStyleMap[viewType]}`}
            onDrop={(e) => handleCardDropFromOutside(e, board)}
            onDragOver={e => e.preventDefault()}>
            {children}
            {
                <div className={`flex-row category-drop-container ${draggedCardIsFromDifferentBoard ? 'board-drop-container' : ''}`}>
                    {draggedCardIsFromDifferentBoard && <div className={`flex-row flex-center category-drop-section ${getDraggedClassName(DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME)}`}
                        ref={setMoveOneNodeRef}>
                        {isOverMoveOne && <div className="category-drop-add-title flex-row"><Icon name={"exposure_plus_1"} /></div>}
                    </div>}
                    {draggedCardIsFromDifferentBoard && <div className={`flex-row flex-center category-drop-section ${getDraggedClassName(DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME)}`}
                        ref={setMoveAllNodeRef}>
                        {isOverMoveAll && <div className="category-drop-overwrite-title flex-row"><Icon name={BOARD_DATA[board].dropIcon} /></div>}
                    </div>}
                </div>
            }

        </div>
    </ExpandableBoard>
}
