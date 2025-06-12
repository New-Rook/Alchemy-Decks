import { ALL_BOARDS } from "../../data/editor"
import { Board } from "../../types"

type Props = {
    boardActive: Record<Board, boolean>
    scrollToBoard: (board: Board) => void
    scrollToLastKnownPosition: () => void
}

export const FloatingScrollMenu = ({ boardActive, scrollToBoard, scrollToLastKnownPosition }: Props) => {
    return <div style={{ position: 'fixed', gap: '0.25em', bottom: '1%', right: '1%', display: 'flex', flexDirection: 'column' }}>
        {ALL_BOARDS.filter(board => boardActive[board]).map(board => <button key={board} onClick={() => scrollToBoard(board)}>Go to {board}</button>)}
        {ALL_BOARDS.some(board => boardActive[board]) && <button onClick={scrollToLastKnownPosition}>Scroll back</button>}
    </div>
}
