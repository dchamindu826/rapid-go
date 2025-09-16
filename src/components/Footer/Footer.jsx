import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Animated Scene eka ain kara */}

      {/* --- Footer Content --- */}
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
          {/* Add social media icons here */}
        </div>
      </div>
      <div className={styles.footerCopyright}>
        <p>&copy; {new Date().getFullYear()} RapidGo. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;