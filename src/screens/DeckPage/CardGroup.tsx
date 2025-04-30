import React from "react"
import { DeckCards } from "../../types"
import { Card } from "./Card"

type Props = {
    groupName: React.ReactNode
    cardNames: string[]
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number) => void
}

export const CardGroup = ({ groupName, cardNames, deckCards, addDeckCardQuantity }: Props) => {
    const numberOfCards = React.useMemo(() => {
        return cardNames.reduce((total, cardName) => total + deckCards[cardName].quantity, 0)
    }, [cardNames, deckCards])

    return (
        <div className="flex-column">
            {groupName} ({numberOfCards})
            <div className="card-group">
                {cardNames.map(cardName =>
                    <Card
                        key={cardName}
                        cardName={cardName}
                        deckCard={deckCards[cardName]}
                        addDeckCardQuantity={addDeckCardQuantity}
                    />
                )}
            </div>
        </div>
    )
}