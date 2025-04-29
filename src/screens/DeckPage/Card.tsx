import { useContext } from "react"
import { DeckCard } from "../../types"
import { AppContext } from "../../context/AppContext"
import { getCardImages } from "../../utilities/card"

type Props = {
    cardName: string
    deckCard: DeckCard
    addDeckCardQuantity: (cardName: string, quantity: number) => void
}

export const Card = ({ cardName, deckCard, addDeckCardQuantity }: Props) => {
    const { cardDictionary } = useContext(AppContext)

    return (
        <div className={`deck-card`} key={cardName}>
            <img src={getCardImages(cardDictionary[cardName]).normal} className='deck-card-image' />
            <div className='card-count-container flex-column'>
                <div className='card-count'>x{deckCard.quantity}</div>
                <div className='flex-row'>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, -1)}>-</button>
                    <button className='flex-button' onClick={() => addDeckCardQuantity(cardName, 1)}>+</button>
                </div>
            </div>
        </div>
    )
}