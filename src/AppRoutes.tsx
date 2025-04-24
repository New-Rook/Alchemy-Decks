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

export const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={'/'} element={<HomePage />} />
                <Route path={'/login'} element={<LoginPage />} />
                <Route path={'/register'} element={<RegisterPage />} />
                <Route path={'/forgot-password'} element={<ForgotPasswordPage />} />
                <Route path={'/decks'} >
                    <Route index element={<DecksPage />} />
                    <Route path={'browse'} element={<BrowseDecksPage />} />
                    <Route path={':id'} element={<DeckPage />} />
                </Route>
                <Route path={'/staples'} >
                    <Route index element={<StaplesPage />} />
                    <Route path={'browse'} element={<BrowseStaplesPage />} />
                    <Route path={':id'} element={<StaplePage />} />
                </Route>
                <Route path={'/settings'} element={<SettingsPage />} />
                <Route path={'*'} element={<NotFoundPage />} />
            </Route >
        </Routes>
    )
}