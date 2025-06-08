import React from "react"

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {

}

export const Label = ({ children, className, ...props }: Props) => {
    return <label {...props} className={`text-medium ${className ?? ''}`}>
        {children}
    </label>
}
