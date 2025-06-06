import React from "react"
import './Menu.css'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    titleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
    titleChildren?: React.ReactNode
}

export const ExpandableText = ({ titleProps, titleChildren, children, ...props }: Props) => {
    const [expanded, setExpanded] = React.useState(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    return <div {...props}>
        <button className="expandable-text-button"
            {...titleProps}
            onClick={toggleExpanded}
        >{titleChildren}</button>
        {expanded && <div>{children}</div>}
    </div>
}
