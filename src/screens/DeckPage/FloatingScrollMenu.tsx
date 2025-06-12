import React from "react"
import { ALL_BOARDS } from "../../data/editor"
import { Board, BoardData } from "../../types"
import { typedKeys } from "../../utilities/general"

type Props = {
    boards: Record<Board, BoardData>
    scrollToBoard: (board: Board) => void
    scrollToLastKnownPosition: () => void
}

export const FloatingScrollMenu = ({ boards, scrollToBoard, scrollToLastKnownPosition }: Props) => {
    const nonEmptyBoards = React.useMemo(() => {
        return typedKeys(boards).filter(board => boards[board].groups.length > 0)
    }, [boards])

    return <div className="floating-scroll-menu">
        {nonEmptyBoards.map(board => <button key={board} onClick={() => scrollToBoard(board)}>Go to {boards[board].name}</button>)}
        {nonEmptyBoards.length > 0 && <button onClick={scrollToLastKnownPosition}>Scroll back</button>}
    </div>
}
