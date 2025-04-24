import React, { useContext } from "react"
import { TextInput } from "../components/TextInput"
import { AuthContext } from "../context/AuthContext"
import { NavButton } from "../components/NavButton"
import { useLocation, useNavigate } from "react-router"

export const ForgotPasswordPage = () => {
    const { state: routeState } = useLocation()
    const navigate = useNavigate()

    const [email, setEmail] = React.useState(routeState?.email ?? '')
    const [errorMessage, setErrorMessage] = React.useState('')

    const { forgotPassword } = useContext(AuthContext)

    const handleForgotPassword = async () => {
        setErrorMessage('')
        const { message } = await forgotPassword(email)
        if (message) {
            setErrorMessage(message)
        } else {
            navigate('/login')
        }
    }

    return (
        <div>
            An email will be send to the following email address to reset your password.
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
            />
            <button onClick={handleForgotPassword}>Confirm</button>
            <NavButton to="/login" >Back to login</NavButton>
            {errorMessage}
        </div>
    )
}