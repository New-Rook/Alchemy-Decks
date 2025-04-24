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

export const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path={'/'} element={<HomePage />} />
                <Route path={'/login'} element={<LoginPage />} />
                <Route path={'/register'} element={<RegisterPage />} />
                <Route path={'/forgot-password'} element={<ForgotPasswordPage />} />
                <Route path={'/deck'} element={<DeckPage />} />
                <Route path={'/staples'} element={<StaplesPage />} />
                <Route path={'/settings'} element={<SettingsPage />} />
                <Route path={'*'} element={<NotFoundPage />} />
            </Route >
        </Routes>
    )
}