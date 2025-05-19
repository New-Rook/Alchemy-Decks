import { DeckStats } from "../types"

type Props = {
    deckStats: DeckStats
}

export const DeckStatsDisplay = ({ deckStats }: Props) => {
    return <div className='flex-column'>
        Deck stats
        <div>
            <p>Number of cards in mainboard {deckStats.mainboard.numberOfCards}</p>
            <p>Number of cards in sideboard {deckStats.sideboard.numberOfCards}</p>
        </div>
        <div>
            {/* <p>Number of cards in mainboard {deckStats.mainboard.cardStats.types}</p>
            <p>Number of cards in sideboard {deckStats.sideboard.numberOfCards}</p> */}
        </div>
    </div>
}
