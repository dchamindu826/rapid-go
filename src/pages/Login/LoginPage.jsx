import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/profile');
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
        }
        setLoading(false);
    };

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
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
            <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
            <button disabled={loading} type="submit" className={styles.loginBtn}>
                {loading ? 'Logging In...' : 'Log In'}
            </button>
        </form>
        <div className={styles.divider}>OR</div>
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