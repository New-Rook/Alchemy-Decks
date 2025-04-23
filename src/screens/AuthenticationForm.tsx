import React from "react"
import { createAccount, signIn } from "../api/common/auth"
import { TextInput } from "../components/TextInput"

type AuthScreen = 'login' | 'register' | 'forgot-password'

export const AuthenticationForm = () => {
    const [screen, setScreen] = React.useState<AuthScreen>('login')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const [expanded, setExpanded] = React.useState(false)

    const login = () => {
        signIn(email, password)
    }

    const register = () => {
        createAccount(email, password)
    }

    return (
        <div>
            <button onClick={() => setExpanded(prev => !prev)}>Account</button>
            {expanded && <div>
                {screen === 'login' && <div>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <button onClick={login}>Log in</button>
                    <button onClick={() => setScreen('register')}>Register instead</button>
                </div>}
                {screen === 'register' && <div>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <button onClick={register}>Register</button>
                    <button onClick={() => setScreen('login')}>Login instead</button>
                </div>}
            </div>}
        </div>
    )
}