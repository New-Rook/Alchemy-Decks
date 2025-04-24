import { Routes, Route } from "react-router"
import { DeckPage } from "./screens/DeckPage"
import { HomePage } from "./screens/HomePage"
import { LoginPage } from "./screens/LoginPage"
import { MainLayout } from "./screens/MainLayout"
import { NotFoundPage } from "./screens/NotFoundPage"
import { SettingsPage } from "./screens/SettingsPage"
import { StaplesPage } from "./screens/StaplesPage"
import { RegisterPage } from "./screens/RegisterPage"
import { ForgotPasswordPage } from "./screens/ForgotPasswordPage"
import { DecksPage } from "./screens/DecksPage"
import { BrowseStaplesPage } from "./screens/BrowseStaplesPage"
import { BrowseDecksPage } from "./screens/BrowseDecksPage"
import { StaplePage } from "./screens/StaplePage"
import { PrivateRoute } from "./components/PrivateRoute"
import { GuestRoute } from "./components/GuestRoute"

export const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={'/'} element={<HomePage />} />
                <Route path={'/login'} element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path={'/register'} element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path={'/forgot-password'} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                <Route path={'/decks'} >
                    <Route index element={<PrivateRoute><DecksPage /></PrivateRoute>} />
                    <Route path={'browse'} element={<BrowseDecksPage />} />
                    <Route path={':id'} element={<DeckPage />} />
                </Route>
                <Route path={'/staples'} >
                    <Route index element={<PrivateRoute><StaplesPage /></PrivateRoute>} />
                    <Route path={'browse'} element={<BrowseStaplesPage />} />
                    <Route path={':id'} element={<StaplePage />} />
                </Route>
                <Route path={'/settings'} element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path={'*'} element={<NotFoundPage />} />
            </Route >
        </Routes>
    )
}