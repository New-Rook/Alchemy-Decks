import React from "react"
import './Menu.css'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    expandOnHover?: boolean
    titleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
    titleChildren?: React.ReactNode
}

export const Menu = ({ expandOnHover, titleProps, titleChildren, children, ...props }: Props) => {
    const [expanded, setExpanded] = React.useState(false)
    const ref = React.useRef(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    React.useEffect(() => {
        const closeMenu = () => {
            if (!ref.current) {
                setTimeout(() => setExpanded(false), 50)
            }
        }

        window.addEventListener('mouseup', closeMenu)

        return () => window.removeEventListener('mouseup', closeMenu)
    }, [])

    return <div {...props} onMouseEnter={expandOnHover ? toggleExpanded : undefined}
        onMouseLeave={expandOnHover ? toggleExpanded : undefined}>
        <button
            {...titleProps}
            onClick={!expandOnHover ? toggleExpanded : undefined}
            onMouseEnter={() => ref.current = true}
            onMouseLeave={() => ref.current = false}
        >{titleChildren}</button>
        {expanded && <div className="menu-content" >{children}</div>}
    </div>
}
