import { Outlet, useNavigate } from "react-router"
import { NavButton } from "../components/NavButton"
import './MainLayout.css'
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Menu } from "../components/Menu"
import { logout } from "../api/common/auth"

export const MainLayout = () => {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const navigateToSettings = () => {
        navigate('/settings')
    }

    const logoutAndNavigateToHome = async () => {
        await logout()
        navigate('/')
    }

    return <>
        <nav className="nav-bar">
            <NavButton to={'/'}>Home</NavButton>
            <NavButton to={'/decks'}>Decks</NavButton>
            <NavButton to={'/staples'}>Staples</NavButton>
            {!!user
                // ? <NavButton to={'/settings'} className="right-nav">Account</NavButton>
                // ? <select className="account-select" value={''} onChange={(e) => selectAccountOption(e.target.value)}>
                //     <option value={''}>Hei</option>
                // </select>
                ? <Menu containerClassName="right-nav" expandedNode={
                    <>
                        <button onClick={navigateToSettings}>Settings</button>
                        <button onClick={logoutAndNavigateToHome}>Logout</button>
                    </>
                }>Account</Menu>
                : <NavButton to={'/login'} className="right-nav">Login</NavButton>
            }
        </nav>
        <Outlet />
    </>
}