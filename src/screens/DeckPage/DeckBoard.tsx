import { Expandable, ExpandableProps } from "../../components/Expandable"
import { Board } from "../../types"

interface Props extends ExpandableProps {
    board: Board
}

export const DeckBoard = ({ board, titleProps, titleChildren, children, ...props }: Props) => {
    return board === 'mainboard'
        ? children
        : <Expandable titleChildren={titleChildren} titleProps={titleProps} {...props}>
            {children}
        </Expandable>
}
