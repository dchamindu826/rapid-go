import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase eken copy karagaththa details ටික මෙතනට දාන්න
const firebaseConfig = {
   apiKey: "AIzaSyCHDuE6paornkV2zbhtbFVoysFLv005HG0",
  authDomain: "rapid-go-f887c.firebaseapp.com",
  projectId: "rapid-go-f887c",
  storageBucket: "rapid-go-f887c.firebasestorage.app",
  messagingSenderId: "150822256660",
  appId: "1:150822256660:web:47c98d86926443c1776701",
  measurementId: "G-YJTDVSYHKK"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();