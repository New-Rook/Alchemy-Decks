import { PropsWithChildren, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router"
import { LoadingWheel } from "./LoadingWheel"

export const PrivateRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useContext(AuthContext)

    if (authStatus === 'pending') {
        return <LoadingWheel />
    }

    return authStatus === 'authenticated' ? children : <Navigate to={'/'} />
}