import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignUpPage = () => {
    const [error, setError] = useState('');
    // Google walin signup wena eka login wena eka wagema nisa signInWithGoogle use karanawa
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignUp = async () => {
        try {
            await signInWithGoogle();
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError('Failed to sign up with Google.');
        }
    };

    return (
        <div className={`${styles.pageContainer} container`}>
            <div className={styles.signupBox}>
                <h2>Create Account</h2>
                <p>Join us with your Google account</p>
                
                {error && <p className={styles.error}>{error}</p>}
                
                <button className={styles.googleBtn} onClick={handleGoogleSignUp}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
                    <span>Sign up with Google</span>
                </button>
                
                <div className={styles.loginRedirect}>
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;