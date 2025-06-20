import React, { useContext } from "react"
import { TextInput } from "../components/TextInput"
import { AuthContext } from "../context/AuthContext"
import { NavButton } from "../components/NavButton"
import { useLocation } from "react-router"

export const RegisterPage = () => {
    const { state: routeState } = useLocation()

    const [email, setEmail] = React.useState(routeState?.email ?? '')
    const [password, setPassword] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')

    const { register } = useContext(AuthContext)

    const handleRegister = async () => {
        setErrorMessage('')
        const { message } = await register(email, password)
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
                minLength={8}
            />
            <button onClick={handleRegister}>Register</button>
            <NavButton to="/login" >Login instead</NavButton>
            {errorMessage}
        </div>
    )
}