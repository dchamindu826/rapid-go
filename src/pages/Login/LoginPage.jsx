import React from 'react';
import styles from './LoginPage.module.css';
import { auth, googleProvider } from '../../firebase'; // Path eka wenas kara
import { signInWithPopup } from 'firebase/auth';

const LoginPage = () => {

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Signed in user:", result.user); 
            // Redirect to home page or dashboard after login
        } catch (error) {
            console.error("Authentication error:", error);
        }
    };

  return (
    <div className={`${styles.pageContainer} container`}>
      <div className={styles.loginBox}>
        <h2>Sign In to RapidGo</h2>
        <p>Sign in with your Google account to get started.</p>
        <button className={styles.googleBtn} onClick={handleGoogleSignIn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;