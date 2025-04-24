import { Outlet } from "react-router"
import { NavButton } from "../components/NavButton"
import './MainLayout.css'
import { AccountMenu } from "./AccountMenu"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Menu } from "../components/Menu"

export const MainLayout = () => {
    const { authStatus } = useContext(AuthContext)

    return <>
        <nav className="nav-bar">
            <NavButton to={'/'}>Home</NavButton>
            {authStatus === 'authenticated' ?
                <>
                    <Menu titleChildren={'Decks'}>
                        <NavButton to={'/decks'}>My Decks</NavButton>
                        <NavButton to={'/decks/browse'}>Browse Decks</NavButton>
                    </Menu>
                    <Menu titleChildren={'Staples'}>
                        <NavButton to={'/staples'}>My Staples</NavButton>
                        <NavButton to={'/staples/browse'}>Browse Staples</NavButton>
                    </Menu>
                </>
                : <>
                    <NavButton to={'/decks/browse'}>Decks</NavButton>
                    <NavButton to={'/staples/browse'}>Staples</NavButton>
                </>}

            <AccountMenu />
        </nav>
        <Outlet />
    </>
}