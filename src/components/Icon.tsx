import { IconSize } from '../types'
import './Icon.css'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    name: string
    size?: IconSize
}

const styleMap: Record<IconSize, string> = {
    small: '',
    medium: '',
    large: 'icon-large',
    giant: 'icon-giant'
}

export const Icon = ({ name, size = 'medium', className, ...props }: Props) => {
    return <span className={`material-symbols-outlined icon ${styleMap[size]} ${className ?? ''}`} {...props}>{name}</span>
}