import React from "react"
import { Board, DeckCards, ViewType } from "../../types"
import { Card } from "./Card"
import { useDroppable } from "@dnd-kit/core"
import './CardGroup.css'
import { COMMANDER_GROUP_NAME, DRAG_AND_DROP_ADD_OPERATION_NAME, DRAG_AND_DROP_ID_DELIMITER, DRAG_AND_DROP_OVERWRITE_OPERATION_NAME, MULTI_COMMANDER_GROUP_NAME, NO_CATEGORY_NAME } from "../../data/editor"
import { cardGroupStyleMap, getCardGroupViewStyle } from "../../styling/editor"
import { Icon } from "../../components/Icon"

type Props = {
    openCommanderPickModal: () => void
}

export const CommanderCardPlaceholder = ({ openCommanderPickModal }: Props) => {
    return <button onClick={openCommanderPickModal} className="deck-card commander-card-placeholder">
        <Icon name={"add"} size="large" /> {/* <button onClick={openCommanderPickModal}>Choose a commander</button> */}
    </button>
}
