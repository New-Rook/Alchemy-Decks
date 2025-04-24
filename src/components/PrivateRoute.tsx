import { PropsWithChildren, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router"

export const PrivateRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useContext(AuthContext)

    return authStatus === 'authenticated' ? children : <Navigate to={'/'} />
}