import { useContext } from "react"
import { LoadingWheel } from "../components/LoadingWheel"
import { Menu } from "../components/Menu"
import { NavButton } from "../components/NavButton"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router"
import { logout } from "../api/common/auth"

export const AccountMenu = () => {
    const { authStatus } = useContext(AuthContext)

    const navigate = useNavigate()

    const navigateToSettings = () => {
        navigate('/settings')
    }

    const logoutAndNavigateToHome = async () => {
        await logout()
        navigate('/')
    }

    if (authStatus === 'authenticated') {
        return (
            <Menu className="right-nav" titleChildren={'Account'}>
                <button onClick={navigateToSettings}>Settings</button>
                <button onClick={logoutAndNavigateToHome}>Logout</button>
            </Menu>
        )
    }

    if (authStatus === 'guest') {
        return <NavButton to={'/login'} className="right-nav">Login</NavButton>
    }

    return <LoadingWheel className="right-nav" />
}