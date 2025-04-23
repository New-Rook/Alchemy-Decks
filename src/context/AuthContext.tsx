import React from "react";
import { auth } from "../api/common/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type AuthContextType = {
    user: User | null
}

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType)

export const AuthContextProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = React.useState<User | null>(null)

    React.useEffect(() => {
        const unsubscribeObserver = onAuthStateChanged(auth, (userData) => {
            if (!userData) {
                console.log('signed out')
                setUser(null)
            }

            console.log('signed in')
            setUser(userData)
        })

        return unsubscribeObserver
    }, [])


    return <AuthContext.Provider value={{ user }}>
        {children}
    </AuthContext.Provider>
}