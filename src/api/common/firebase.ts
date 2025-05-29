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
    apiKey: "AIzaSyAJp2R7woQJKd04e-n5YVU3OFbQosetm-A",
    authDomain: "alchemydecks-staging.firebaseapp.com",
    projectId: "alchemydecks-staging",
    storageBucket: "alchemydecks-staging.firebasestorage.app",
    messagingSenderId: "1056856553816",
    appId: "1:1056856553816:web:4e246d37affd5f8946cd2d",
    measurementId: "G-K6ERHYCKHY"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
const analytics = getAnalytics(app)