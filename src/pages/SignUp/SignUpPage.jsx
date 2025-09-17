import React, { useState } from 'react';
import styles from './SignUpPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // AuthContext eka use karanna

const SignUpPage = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth(); // signup function eka gannawa
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(formData.email, formData.password, formData.firstName, formData.lastName);
            navigate('/profile'); // Signup unama profile ekata yawanawa
        } catch (err) {
            setError('Failed to create an account. This email may already be in use.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className={`${styles.pageContainer} container`}>
            <div className={styles.signupBox}>
                <h2>Create an Account</h2>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.signupForm}>
                    <div className={styles.nameFields}>
                        <input type="text" name="firstName" placeholder="First Name" required onChange={handleChange} />
                        <input type="text" name="lastName" placeholder="Last Name" required onChange={handleChange} />
                    </div>
                    <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password (min. 6 characters)" required onChange={handleChange} />
                    <button disabled={loading} type="submit" className={styles.signupBtn}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className={styles.loginRedirect}>
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;