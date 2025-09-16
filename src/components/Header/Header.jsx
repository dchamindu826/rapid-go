import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import { FiHome, FiShoppingCart, FiTruck, FiInfo, FiMail, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src="/logo.png" alt="RapidGo Logo" />
      </Link>
      
      <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileActive : ''}`}>
        <NavLink to="/" className={styles.navLink} onClick={toggleMobileMenu} end>
          <FiHome className={styles.icon} /> <span>Home</span>
        </NavLink>
        <NavLink to="/shop" className={styles.navLink} onClick={toggleMobileMenu}>
          <FiShoppingCart className={styles.icon} /> <span>Shopping</span>
        </NavLink>
        <NavLink to="/tracking" className={styles.navLink} onClick={toggleMobileMenu}>
          <FiTruck className={styles.icon} /> <span>Tracking</span>
        </NavLink>
        <NavLink to="/about" className={styles.navLink} onClick={toggleMobileMenu}>
          <FiInfo className={styles.icon} /> <span>About</span>
        </NavLink>
        <NavLink to="/contact" className={styles.navLink} onClick={toggleMobileMenu}>
          <FiMail className={styles.icon} /> <span>Contact Us</span>
        </NavLink>
      </nav>

      <div className={styles.headerActions}>
        <Link to="/cart" className={`${styles.actionBtn} ${styles.cartBtn}`}>
          <FiShoppingBag />
          {cartItems.length > 0 && (
            <span className={styles.cartCount}>{cartItems.length}</span>
          )}
        </Link>
        <Link to="/profile" className={styles.actionBtn}>
          <FiUser />
        </Link>
      </div>
    </header>
  );
};

export default Header;