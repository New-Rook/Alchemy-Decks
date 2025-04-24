import React from "react";
import { auth } from "../api/common/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { createAccount, sendForgotPasswordEmail, signIn } from "../api/common/auth";
import { useNavigate } from "react-router";

type AuthContextType = {
    user: User | null
    login: (email: string, password: string) => Promise<{ message?: string }>
    register: (email: string, password: string) => Promise<{ message?: string }>
    forgotPassword: (email: string) => Promise<{ message?: string }>
}

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType)

const INVALID_EMAIL = 'Please enter a valid email address.'
const PASSWORD_TOO_SHORT = 'Your password must be at least 8 characters long.'
const INVALID_PASSWORD = 'Please enter a valid password.'
const INCORRECT_CREDENTIALS_MESSAGE = 'The email/password you have entered are incorrect.'
const REGISTER_INVALID_CREDENTIALS_MESSAGE = 'Please enter a valid email address and password.'

export const AuthContextProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = React.useState<User | null>(null)
    const navigate = useNavigate()

    React.useEffect(() => {
        const unsubscribeObserver = onAuthStateChanged(auth, (userData) => {
            if (!userData) {
                console.log('signed out')
            } else {
                console.log('signed in')
            }
            setUser(userData)
        })

        return unsubscribeObserver
    }, [])

    const login = async (email: string, password: string) => {
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail) {
            return { message: INVALID_EMAIL }
        }
        if (!trimmedPassword) {
            return { message: INVALID_PASSWORD }
        }

        const { user, error } = await signIn(trimmedEmail, trimmedPassword)
        if (error) {
            return { message: INCORRECT_CREDENTIALS_MESSAGE }
        }
        if (user) {
            navigate('/')
            return { message: undefined }
        }

        return { message: INCORRECT_CREDENTIALS_MESSAGE }
    }

    const register = async (email: string, password: string) => {
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail) {
            return { message: INVALID_EMAIL }
        }
        if (trimmedPassword.length < 8) {
            return { message: PASSWORD_TOO_SHORT }
        }

        const { user, error } = await createAccount(trimmedEmail, trimmedPassword)
        if (error && error.code === 'auth/invalid-email') {
            return { message: INVALID_EMAIL }
        }
        if (user) {
            navigate('/login', { state: { email } })
            return { message: undefined }
        }

        return { message: REGISTER_INVALID_CREDENTIALS_MESSAGE }
    }

    const forgotPassword = async (email: string) => {
        const trimmedEmail = email.trim()

        if (!trimmedEmail) {
            return { message: INVALID_EMAIL }
        }

        const { error } = await sendForgotPasswordEmail(trimmedEmail)

        if (error) {
            return { message: INVALID_EMAIL }
        }

        return { message: undefined }
    }

    return <AuthContext.Provider value={{ user, login, register, forgotPassword }}>
        {children}
    </AuthContext.Provider>
}