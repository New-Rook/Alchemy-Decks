import React from "react"

interface Props extends React.HTMLAttributes<HTMLDivElement> {

}

export const Modal = ({ children, className, ...props }: Props) => {
    return <div {...props} className={`modal ${className ?? ''}`}>
        {children}
    </div>
}
