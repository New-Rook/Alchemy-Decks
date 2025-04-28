import { PropsWithChildren, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router"
import { LoadingScreen } from "./LoadingScreen"

export const PrivateRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useContext(AuthContext)

    if (authStatus === 'pending') {
        return <LoadingScreen />
    }

    return authStatus === 'authenticated' ? children : <Navigate to={'/'} />
}