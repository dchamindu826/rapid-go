import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCHDuE6paornkV2zbhtbFVoysFLv005HG0",
    authDomain: "rapid-go-f887c.firebaseapp.com",
    projectId: "rapid-go-f887c",
    storageBucket: "rapid-go-f887c.appspot.com",
    messagingSenderId: "150822256660",
    appId: "1:150822256660:web:47c98d86926443c1776701",
    measurementId: "G-YJTDVSYHKK"
};

// Robust Firebase Initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export all services
export { app, auth, db, googleProvider };