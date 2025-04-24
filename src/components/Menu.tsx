import React from "react"
import './Menu.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    expandOnHover?: boolean
    expandedNode?: React.ReactNode
    containerClassName?: string
}

export const Menu = ({ expandOnHover, expandedNode, containerClassName, ...props }: Props) => {
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

    return <div className={containerClassName} onMouseEnter={expandOnHover ? toggleExpanded : undefined}
        onMouseLeave={expandOnHover ? toggleExpanded : undefined}>
        <button
            {...props}
            onClick={!expandOnHover ? toggleExpanded : undefined}
            onMouseEnter={() => ref.current = true}
            onMouseLeave={() => ref.current = false}
        />
        {expanded && <div className="menu-content" >{expandedNode}</div>}
    </div>
}
