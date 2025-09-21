import React from 'react';
import styles from './Footer.module.css';
import { FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* --- New Spacer Element --- */}
      <div className={styles.topSpacer}></div>

      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerAbout}>
          <img src="/logo.png" alt="RapidGo Logo" className={styles.footerLogo} />
          <p>Your trusted partner for fast, reliable, and affordable delivery solutions across the island.</p>
        </div>
        <div className={styles.footerLinks}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/tracking">Delivery Tracking</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className={styles.footerSocial}>
          <h4>Follow Us</h4>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/share/1EWDr4iu6q/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
            <a href="https://www.tiktok.com/@rapid.go.delivery?_t=ZS-8znMYWYMc6M&_r=1" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
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