import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export const createAccount = async (email: string, password: string) => {
    const emailValidationRegex = /./
    const passwordValidationRegex = /./

    if (!emailValidationRegex.test(email)) {
        console.log('email invalid')
        // warn user
        return
    }

    if (!passwordValidationRegex.test(password)) {
        console.log('password invalid')
        // warn user
        return
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            // ...
            console.log({ user })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            console.log({ errorCode, errorMessage })
        });
}

export const signIn = async (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
}