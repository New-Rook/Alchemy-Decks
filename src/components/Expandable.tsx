import React from "react"
import './Expandable.css'
import { Icon } from "./Icon"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    titleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
    titleChildren?: React.ReactNode
}

export const Expandable = ({ titleProps, className, titleChildren, children, ...props }: Props) => {
    const [expanded, setExpanded] = React.useState(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    return <div {...props}>
        <button
            {...titleProps}
            className={`flex-row flex-center flex-gap transparent-background expandable-button ${titleProps?.className ?? ''}`}
            onClick={toggleExpanded}
        ><Icon name={expanded ? 'arrow_drop_down' : 'arrow_right'} />{titleChildren}</button>
        {expanded && <div className="expandable-content">{children}</div>}
    </div>
}
