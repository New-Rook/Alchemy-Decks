import { DeckCards } from "../../types"
import { Card } from "./Card"

type Props = {
    groupName: React.ReactNode
    cardNames: string[]
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number) => void
}

export const CardGroup = ({ groupName, cardNames, deckCards, addDeckCardQuantity }: Props) => {
    return (
        <div className="flex-column">
            {groupName}
            <div className="card-group">
                {cardNames.map(cardName =>
                    <Card
                        cardName={cardName}
                        deckCard={deckCards[cardName]}
                        addDeckCardQuantity={addDeckCardQuantity}
                    />
                )}
            </div>
        </div>
    )
}