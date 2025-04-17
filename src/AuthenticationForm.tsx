import React from "react"
import { createAccount, signIn } from "./api/common/auth"

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
                    <label htmlFor="name">Email</label>
                    <input
                        type="text"
                        // id="email"
                        name="email"
                        size={10}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label htmlFor="name">Password</label>
                    <input
                        type="text"
                        // id="password"
                        name="password"
                        size={10}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button onClick={login}>Log in</button>
                    <button onClick={() => setScreen('register')}>Register instead</button>
                </div>}
                {screen === 'register' && <div>
                    <label htmlFor="name">Email</label>
                    <input
                        type="text"
                        // id="email"
                        name="email"
                        size={10}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label htmlFor="name">Password</label>
                    <input
                        type="text"
                        // id="password"
                        name="password"
                        size={10}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button onClick={register}>Register</button>
                    <button onClick={() => setScreen('login')}>Login instead</button>
                </div>}
            </div>}
        </div>
    )
}