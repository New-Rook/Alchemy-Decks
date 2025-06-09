import React from "react"
import { Board, DeckCards, ViewType } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { COMMANDER_GROUP_NAME, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, MULTI_COMMANDER_GROUP_NAME, NO_CATEGORY_NAME } from "../../data/editor"
import { cardGroupStyleMap, getCardGroupViewStyle } from "../../styling/editor"

type Props = {
    commanders: string[]
    deckCards: DeckCards
    addDeckCardQuantity: (cardName: string, quantity: number, board: Board) => void
    enableDragAndDrop: boolean
    selectedCards: Record<string, Board>
    selectCard: (cardName: string, board: Board) => void
    board: Board
    legalityWarnings: Record<string, string>
    openCommanderPickModal: (index: number) => void
    secondCommanderPickAvailable: boolean
    removeSecondCommander: () => void
    viewType: ViewType
}

export const CommanderCardGroup = ({ commanders, deckCards, addDeckCardQuantity, enableDragAndDrop, selectedCards, selectCard, board, legalityWarnings, openCommanderPickModal, secondCommanderPickAvailable, removeSecondCommander, viewType }: Props) => {
    const [isHovering, setIsHovering] = React.useState(false)

    return (
        <div className={`card-group flex-column flex-gap-small position-relative ${isHovering ? 'group-elevated' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            {commanders.length > 1 ? MULTI_COMMANDER_GROUP_NAME : COMMANDER_GROUP_NAME}
            <div className={`position-relative ${cardGroupStyleMap[viewType]}`} style={getCardGroupViewStyle(viewType, commanders.length)}>
                <div>
                    {commanders[0]
                        ? <Card
                            key={commanders[0]}
                            groupName={COMMANDER_GROUP_NAME}
                            cardName={commanders[0]}
                            deckCard={deckCards[commanders[0]]}
                            addDeckCardQuantity={addDeckCardQuantity}
                            enableDragAndDrop={enableDragAndDrop}
                            selectCard={selectCard}
                            selected={selectedCards[commanders[0]] === board}
                            board={board}
                            legalityWarning={legalityWarnings[commanders[0]]}
                            viewType={viewType}
                            index={0}
                        />
                        : <div className="deck-card" style={{ border: '4px solid black' }}>
                            <button onClick={() => openCommanderPickModal(0)}>Choose a commander</button>
                        </div>
                    }
                    {commanders[0] && <button onClick={() => openCommanderPickModal(0)}>Change commander</button>}
                </div>
                {secondCommanderPickAvailable &&
                    <div>
                        {commanders[1]
                            ? <Card
                                key={commanders[1]}
                                groupName={COMMANDER_GROUP_NAME}
                                cardName={commanders[1]}
                                deckCard={deckCards[commanders[1]]}
                                addDeckCardQuantity={addDeckCardQuantity}
                                enableDragAndDrop={enableDragAndDrop}
                                selectCard={selectCard}
                                selected={selectedCards[commanders[1]] === board}
                                board={board}
                                legalityWarning={legalityWarnings[commanders[1]]}
                                viewType={viewType}
                                index={1}
                            />
                            : <div className="deck-card" style={{ border: '4px solid black' }}>
                                <button onClick={() => openCommanderPickModal(1)}>Choose a commander</button>
                            </div>
                        }
                        {commanders[1] && <button onClick={() => openCommanderPickModal(1)}>Change commander</button>}
                        {commanders[1] && <button onClick={removeSecondCommander}>Remove commander</button>}
                    </div>
                }
            </div>
        </div >
    )
}