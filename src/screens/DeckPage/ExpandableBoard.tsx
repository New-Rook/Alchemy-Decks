import { PropsWithChildren } from "react"
import { Expandable, ExpandableProps } from "../../components/Expandable"
import { BOARD_DATA, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_MOVE_ALL_TO_BOARD_OPERATION_NAME, DRAG_AND_DROP_MOVE_ONE_TO_BOARD_OPERATION_NAME } from "../../data/editor"
import { Board, ViewType } from "../../types"
import { boardStyleMap } from "../../styling/editor"
import { useDroppable } from "@dnd-kit/core"
import React from "react"

interface Props extends PropsWithChildren {
    board: Board
}

export const ExpandableBoard = ({ board, children, ...props }: Props) => {
    return board === 'mainboard'
        ? children
        : <Expandable defaultExpanded={true} titleChildren={BOARD_DATA[board].name} titleProps={{ className: 'button-no-hover' }} {...props}>
            {children}
        </Expandable>
}
