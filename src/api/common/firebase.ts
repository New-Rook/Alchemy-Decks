// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAk4NdRevn0Hx3vivn8vDODOrMAxOXBmog",
    authDomain: "zoro-deck-builder.firebaseapp.com",
    projectId: "zoro-deck-builder",
    storageBucket: "zoro-deck-builder.firebasestorage.app",
    messagingSenderId: "927918497021",
    appId: "1:927918497021:web:b85c038d522cc27ec8f294",
    measurementId: "G-W82QYXFQHR"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const firestore = getFirestore(app)
export const auth = getAuth(app)