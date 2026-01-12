import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [error, setError] = useState('');
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            navigate('/profile');
        } catch (error) {
            setError('Failed to sign in with Google.');
        }
    };

  return (
    <div className={`${styles.pageContainer} container`}>
      <div className={styles.loginBox}>
        <h2>Sign In</h2>
        <p>Login with your Google account to continue</p>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <button className={styles.googleBtn} onClick={handleGoogleSignIn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          <span>Sign in with Google</span>
        </button>
        
        <div className={styles.signupRedirect}>
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;