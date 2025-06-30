import './CardGroup.css'
import { Icon } from "../../components/Icon"

type Props = {
    openCommanderPickModal: () => void
}

export const CommanderCardPlaceholder = ({ openCommanderPickModal }: Props) => {
    return <button onClick={openCommanderPickModal} className="deck-card commander-card-placeholder">
        <Icon name={"add"} size="large" /> {/* <button onClick={openCommanderPickModal}>Choose a commander</button> */}
    </button>
}
