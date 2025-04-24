import { PropsWithChildren, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router"

export const GuestRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useContext(AuthContext)

    if (authStatus === 'pending') {
        return <div />
    }

    return authStatus === 'guest' ? children : <Navigate to={'/'} />
}