import React from "react"
import { Board, DeckCards, ViewType } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { COMMANDER_GROUP_NAME, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, MULTI_COMMANDER_GROUP_NAME, NO_CATEGORY_NAME } from "../../data/editor"
import { cardGroupStyleMap, getCardGroupViewStyle } from "../../styling/editor"
import { CommanderCardPlaceholder } from "./CommanderCardPlaceholder"

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
    colorIdentityLabel: React.ReactNode
}

export const CommanderCardGroup = ({
    commanders,
    deckCards,
    addDeckCardQuantity,
    enableDragAndDrop,
    selectedCards,
    selectCard,
    board,
    legalityWarnings,
    openCommanderPickModal,
    secondCommanderPickAvailable,
    removeSecondCommander,
    viewType,
    colorIdentityLabel
}: Props) => {
    const [isHovering, setIsHovering] = React.useState(false)
    const [fullyShownCardName, setFullyShownCardName] = React.useState('')

    const showFullCard = React.useCallback((cardName: string) => {
        setFullyShownCardName(cardName)
    }, [])

    const fullyShownCardIndex = React.useMemo(() => {
        const indexFound = commanders.indexOf(fullyShownCardName)
        return indexFound > -1 ? indexFound : undefined
    }, [commanders, fullyShownCardName])

    return (
        <div className={`card-group commander-card-group flex-column flex-gap-small position-relative ${isHovering ? 'group-elevated' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <span className="card-group-title flex-row flex-gap-small align-center">
                {commanders.length > 1 ? MULTI_COMMANDER_GROUP_NAME : COMMANDER_GROUP_NAME} {colorIdentityLabel}
            </span>
            <div className={`position-relative ${cardGroupStyleMap[viewType]}`} style={getCardGroupViewStyle(viewType, commanders.length, fullyShownCardIndex)}>
                <div className="flex-column">
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
                            format={'commander'}
                            showFullCard={showFullCard}
                            isCommander
                        />
                        : <CommanderCardPlaceholder openCommanderPickModal={() => openCommanderPickModal(0)} />
                    }
                    {commanders[0] && <button onClick={() => openCommanderPickModal(0)}>Change commander</button>}
                </div>
                {secondCommanderPickAvailable &&
                    <div className="flex-column">
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
                                format={'commander'}
                                showFullCard={showFullCard}
                                isCommander
                            />
                            : <CommanderCardPlaceholder openCommanderPickModal={() => openCommanderPickModal(1)} />
                        }
                        {commanders[1] && <button onClick={() => openCommanderPickModal(1)}>Change commander</button>}
                        {commanders[1] && <button onClick={removeSecondCommander}>Remove commander</button>}
                    </div>
                }
            </div>
        </div >
    )
}