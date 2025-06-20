import React from "react"
import { BOARD_DATA } from "../../data/editor"
import { Board, CardGroupData } from "../../types"
import { typedKeys } from "../../utilities/general"
import { IconButton } from "../../components/IconButton"

type Props = {
    boardGroups: Record<Board, CardGroupData[]>
    scrollToBoard: (board: Board) => void
    scrollToLastKnownPosition: () => void
}

export const FloatingScrollMenu = ({ boardGroups, scrollToBoard, scrollToLastKnownPosition }: Props) => {
    const nonEmptyBoards = React.useMemo(() => {
        return typedKeys(boardGroups).filter(board => boardGroups[board].length > 0)
    }, [boardGroups])

    return <div className="floating-scroll-menu">
        {nonEmptyBoards.map(board => <IconButton key={board} iconName={BOARD_DATA[board].icon} onClick={() => scrollToBoard(board)}>Go to {BOARD_DATA[board].name}</IconButton>)}
        {nonEmptyBoards.length > 0 && <IconButton iconName='arrow_back' onClick={scrollToLastKnownPosition}>Scroll back</IconButton>}
    </div>
}
