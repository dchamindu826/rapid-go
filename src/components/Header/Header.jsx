import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { FiHome, FiShoppingCart, FiTruck, FiInfo, FiMail, FiShoppingBag, FiUser, FiMenu, FiX, FiBox } from 'react-icons/fi'; // FiBox icon eka add kala
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const { cartItems } = useCart();
    const { currentUser, logout } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = async () => {
      try {
          await logout();
          navigate('/login');
      } catch (error) {
          console.error("Failed to log out", error);
      }
    };

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.headerContainer}`}>
                <Link to="/" className={styles.logo}>
                    <img src="/logo.png" alt="RapidGo Logo" />
                </Link>

                <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileActive : ''}`}>
                    <NavLink to="/" className={styles.navLink} onClick={toggleMobileMenu} end>Home</NavLink>
                    <NavLink to="/shop" className={styles.navLink} onClick={toggleMobileMenu}>Shopping</NavLink>
                    <NavLink to="/create-order" className={styles.navLink} onClick={toggleMobileMenu}>Order Request</NavLink> {/* <-- ALUTH LINK EKA */}
                    <NavLink to="/tracking" className={styles.navLink} onClick={toggleMobileMenu}>Tracking</NavLink>
                    <NavLink to="/about" className={styles.navLink} onClick={toggleMobileMenu}>About</NavLink>
                    <NavLink to="/contact" className={styles.navLink} onClick={toggleMobileMenu}>Contact Us</NavLink>
                </nav>

                <div className={styles.headerActions}>
                    <Link to="/cart" className={`${styles.actionBtn} ${styles.cartBtn}`}>
                        <FiShoppingBag />
                        {cartItems.length > 0 && <span className={styles.cartCount}>{cartItems.length}</span>}
                    </Link>
                    
                    {currentUser ? (
                        <div className={styles.profileDropdown}>
                            {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} alt="Profile" className={styles.profilePic} referrerPolicy="no-referrer" />
                            ) : (
                                <div className={styles.profilePicIcon}>
                                    <FiUser />
                                </div>
                            )}
                            <div className={styles.dropdownContent}>
                                <Link to="/profile">My Profile</Link>
                                <button onClick={handleLogout}>Log Out</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className={styles.actionBtn}>
                            <FiUser />
                        </Link>
                    )}

                    <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;