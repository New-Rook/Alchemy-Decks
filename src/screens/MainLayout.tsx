import { Outlet } from "react-router"
import { NavButton } from "../components/NavButton"
import './MainLayout.css'
import { AccountMenu } from "./AccountMenu"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Menu } from "../components/Menu"
import { ImageIcon } from "../components/ImageIcon"

export const MainLayout = () => {
    const { authStatus } = useContext(AuthContext)

    return <>
        <nav className="nav-bar">
            <NavButton to={'/'} className="nav-bar-button flex-row flex-center transparent-background">
                <ImageIcon src={'/logo.jpg'} className="logo" />
                <p>Alchemy Decks</p>
            </NavButton>
            {authStatus === 'authenticated' ?
                <>
                    <Menu titleChildren={'Decks'} className="nav-bar-button">
                        <NavButton to={'/decks'}>My Decks</NavButton>
                        <NavButton to={'/decks/browse'}>Browse Decks</NavButton>
                    </Menu>
                    <Menu titleChildren={'Staples'} className="nav-bar-button">
                        <NavButton to={'/staples'}>My Staples</NavButton>
                        <NavButton to={'/staples/browse'}>Browse Staples</NavButton>
                    </Menu>
                </>
                : <>
                    <NavButton to={'/decks/browse'} className="nav-bar-button">Decks</NavButton>
                    <NavButton to={'/staples/browse'} className="nav-bar-button">Staples</NavButton>
                </>
            }

            <AccountMenu />
        </nav>
        <div className="content">
            <Outlet />
        </div>
        <div style={{ backgroundColor: 'darkgray', marginTop: '5em', padding: '1em', display: 'flex', flexDirection: 'column' }}>
            <p>Portions of Alchemy Decks are unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. The literal and graphical information presented on this site about Magic: The Gathering, including card images and mana symbols, is copyright Wizards of the Coast, LLC.</p>
            <p>All other content © 2025 Alchemy Decks.</p>
        </div>
    </>
}