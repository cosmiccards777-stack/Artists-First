import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyABZDyRr3_aMqbJD6VdLumnvueqY71WvdM",
    authDomain: "artists-first.firebaseapp.com",
    projectId: "artists-first",
    storageBucket: "artists-first.firebasestorage.app",
    messagingSenderId: "940530686691",
    appId: "1:940530686691:web:81a90b4b790a1c22f003d6",
    measurementId: "G-BLW0C9CJS8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
