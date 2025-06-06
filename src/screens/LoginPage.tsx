import React, { useContext } from "react"
import { TextInput } from "../components/TextInput"
import { AuthContext } from "../context/AuthContext"
import { NavButton } from "../components/NavButton"
import { useLocation } from "react-router"

export const LoginPage = () => {
    const { state: routeState } = useLocation()

    const [email, setEmail] = React.useState(routeState?.email ?? '')
    const [password, setPassword] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')

    const { login } = useContext(AuthContext)

    const handleLogin = async () => {
        setErrorMessage('')
        const { message } = await login(email, password)
        if (message) {
            setErrorMessage(message)
        }
    }

    return (
        <div>
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                type={'password'}
            />
            <button onClick={handleLogin}>Log in</button>
            <NavButton to="/forgot-password" options={{ state: { email } }} >Forgot password</NavButton>
            <NavButton to="/register" >Register instead</NavButton>
            {errorMessage}
        </div>
    )
}