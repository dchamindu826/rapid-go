import React from 'react';
import styles from './Footer.module.css';
import { FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* ... (Animation eka thibba kotasa) ... */}
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerAbout}>
          <img src="/logo.png" alt="RapidGo Logo" className={styles.footerLogo} />
          <p>Your trusted partner for fast, reliable, and affordable delivery solutions across the island.</p>
        </div>
        <div className={styles.footerLinks}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Shop</a></li>
            <li><a href="#">Delivery Tracking</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className={styles.footerSocial}>
          <h4>Follow Us</h4>
          {/* Aluth social icons tika */}
          <div className={styles.socialIcons}>
            <a href="#" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
            <a href="https://wa.me/94706004033" target="_blank" rel="noopener noreferrer"><FiMessageCircle /></a>
          </div>
        </div>
      </div>
      <div className={styles.footerCopyright}>
        <p>&copy; {new Date().getFullYear()} RapidGo. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;