import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export const createAccount = async (email: string, password: string) => {
    // const emailValidationRegex = /./
    // const passwordValidationRegex = /./

    // if (!emailValidationRegex.test(email)) {
    //     console.log('email invalid')
    //     // warn user
    //     return 
    // }

    // if (!passwordValidationRegex.test(password)) {
    //     console.log('password invalid')
    //     // warn user
    //     return { user: null, error: 'Invalid password' }
    // }

    return await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            // ...
            console.log({ user })
            return { user, error: undefined }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            console.log({ errorCode, errorMessage })
            return { user: null, error }
        });
}

export const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
            return { user, error: undefined }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            return { user: null, error }
        });
}

export const logout = async () => {
    await signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}

export const sendForgotPasswordEmail = async (email: string) => {
    return await sendPasswordResetEmail(auth, email)
        .then(() => {
            return { error: undefined }
        })
        .catch((error) => {
            return { error }
        });
}