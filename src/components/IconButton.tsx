import React from 'react'
import { Icon } from './Icon'
import './Icon.css'
import { IconSize } from '../types'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName: string
    size?: IconSize
}

const styleMap: Record<IconSize, string> = {
    tiny: 'icon-button-tiny',
    small: "icon-button-small",
    medium: "icon-button",
    large: "",
    giant: ""
}

export const IconButton = ({ iconName, size = 'medium', className, children, ...props }: Props) => {
    return <button {...props}
        className={`${children ? 'icon-button-with-text' : styleMap[size]} flex-row flex-gap ${className ?? ''}`}>
        <Icon name={iconName} />
        {children && <span>{children}</span>}
    </button>
}