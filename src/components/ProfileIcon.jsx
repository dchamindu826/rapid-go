import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Oyage AuthContext eke path eka hariyata danna
import styles from './ProfileIcon.module.css';
import { FiUser } from 'react-icons/fi'; // Default icon ekak

const ProfileIcon = () => {
    const { currentUser } = useAuth();

    // User kenek login wela nethnam, kisima deyak pennanne nehe
    if (!currentUser) {
        return null;
    }

    return (
        <Link to="/profile" className={styles.profileLink}>
            {currentUser.photoURL ? (
                // Gmail eke image ekak thiyenawanam, eka pennanawa
                <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className={styles.profileImage} 
                    referrerPolicy="no-referrer" // Bazeldekin meka danna, Google image block wena eka nawaththanna
                />
            ) : (
                // Gmail eke image ekak nathnam, default icon eka pennanawa
                <div className={styles.defaultIcon}>
                    <FiUser size={20} />
                </div>
            )}
            <span className={styles.profileText}>Profile</span>
        </Link>
    );
};

export default ProfileIcon;