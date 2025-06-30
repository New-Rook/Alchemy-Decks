import { Board, DeckCard } from "../types"
import { AppContext } from "../context/AppContext"
import { getCardFrontImage } from "../utilities/card"
import './DeckPage/Card.css'
import React from "react"
import { IconButton } from "../components/IconButton"

type Props = {
    cardName: string
    deckCard?: DeckCard
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
    isCommander: boolean
    style?: React.HTMLAttributes<HTMLDivElement>['style']
}

export const CardPreview = ({ cardName, deckCard, addDeckCardQuantity, isCommander, style }: Props) => {
    const { cardDictionary } = React.useContext(AppContext)

    const [flipped, setFlipped] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)

    const flipCard = (e: React.MouseEvent<HTMLButtonElement>) => {
        setFlipped(!flipped)
        e.stopPropagation()
    }

    const imageSource = React.useMemo(() => {
        if (cardDictionary[cardName].card_faces && flipped) {
            return deckCard?.print?.uris[1] ?? cardDictionary[cardName].card_faces[1].image_uris.normal
        }

        return deckCard?.print?.uris[0] ?? getCardFrontImage(cardDictionary[cardName]).normal
    }, [cardDictionary, cardName, flipped, deckCard])

    const expandedCardClassName = React.useMemo(() => {
        if (!isHovering) {
            return ''
        }

        return 'expanded-card-active'
    }, [isHovering])

    return (
        <div className={`deck-card ${isHovering ? 'card-elevated' : ''}`} style={style}
            key={cardName}
            onClick={isCommander ? () => addDeckCardQuantity(cardName, 1, 'mainboard') : undefined}>
            {/* Top left */}
            <div className={cardDictionary[cardName].card_faces ? 'deck-flip-card-top-left-container' : 'deck-card-top-left-container'}>
                {cardDictionary[cardName].card_faces && <IconButton iconName="cached" className='card-flip-button' onClick={flipCard} onPointerDown={(e) => e.stopPropagation()} />}
            </div>

            {/* Main image */}
            <div className='flex-row deck-card-image'>
                <img src={imageSource} className='deck-card-image' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} draggable={false} />
            </div>

            {/* Expanded card */}
            <div className={`flex-column expanded-card ${expandedCardClassName} ${isHovering ? 'expanded-card-active' : ''}`}>
                <img src={imageSource} className={`deck-card-image`} draggable={false} />
            </div>

            {/* Top right */}
            {!isCommander && <div className='deck-card-data-elevated card-count-container flex-column' onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {deckCard && <div className='card-count'>{deckCard.boards.mainboard}</div>}
                <div className='flex-row'>
                    <IconButton size={'tiny'} onClick={() => addDeckCardQuantity(cardName, -1, 'mainboard')} iconName={"remove"} />
                    <IconButton size={'tiny'} onClick={() => addDeckCardQuantity(cardName, 1, 'mainboard')} iconName={"add"} />
                </div>
            </div>}
        </div >
    )
}