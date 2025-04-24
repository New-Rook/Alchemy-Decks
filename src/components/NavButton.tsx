import { NavigateOptions, useNavigate } from "react-router"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    to: string
    options?: NavigateOptions
}

export const NavButton = ({ to, options, ...props }: Props) => {
    const navigate = useNavigate()

    const navigateTo = () => {
        navigate(to, options)
    }

    return <button {...props} onClick={navigateTo} />
}