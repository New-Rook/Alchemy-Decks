import { ALL_BOARDS } from "../data/editor"
import { Board } from "../types"

type Props = {
    scrollToBoard: (board: Board) => void
    scrollToLastKnownPosition: () => void
}

export const FloatingScrollMenu = ({ scrollToBoard, scrollToLastKnownPosition }: Props) => {
    return <div style={{ position: 'fixed', gap: '0.25em', bottom: '1%', right: '1%', display: 'flex', flexDirection: 'column' }}>
        {ALL_BOARDS.map(board => <button onClick={() => scrollToBoard(board)}>Go to {board}</button>)}
        <button onClick={scrollToLastKnownPosition}>Scroll back</button>
    </div>
}
