import './Icon.css'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    name: string
}

export const Icon = ({ name, className, ...props }: Props) => {
    return <span className={`material-symbols-outlined icon ${className ?? ''}`} {...props}>{name}</span>
}