import { PropsWithChildren, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router"
import { LoadingWheel } from "./LoadingWheel"

export const GuestRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useContext(AuthContext)

    if (authStatus === 'pending') {
        return <LoadingWheel />
    }

    return authStatus === 'guest' ? children : <Navigate to={'/'} />
}