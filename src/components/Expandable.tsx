import React from "react"
import './Expandable.css'
import { Icon } from "./Icon"

export interface ExpandableProps extends React.HTMLAttributes<HTMLDivElement> {
    titleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
    titleChildren?: React.ReactNode
    contentProps?: React.HTMLAttributes<HTMLDivElement>
    defaultExpanded?: boolean
}

export const Expandable = ({ defaultExpanded, titleProps, titleChildren, contentProps, children, ...props }: ExpandableProps) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    return <div {...props}>
        <button
            {...titleProps}
            className={`flex-row flex-center flex-gap transparent-background expandable-button ${titleProps?.className ?? ''}`}
            onClick={toggleExpanded}
        ><Icon name={expanded ? 'arrow_drop_down' : 'arrow_right'} />{titleChildren}</button>
        {expanded && <div {...contentProps} className={`expandable-content ${contentProps?.className ?? ''}`}>{children}</div>}
    </div>
}
