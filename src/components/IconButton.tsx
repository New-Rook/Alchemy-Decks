import { Icon } from './Icon'
import './Icon.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName: string
}

export const IconButton = ({ iconName, className, children, ...props }: Props) => {
    return <button {...props} className={`${children ? 'icon-button-with-text' : 'icon-button'} flex-row flex-gap ${className ?? ''}`}>
        <Icon name={iconName} />
        {children && <span>{children}</span>}
    </button>
}