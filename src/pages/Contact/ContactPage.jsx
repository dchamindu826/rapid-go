import React from 'react';
import styles from './ContactPage.module.css';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa'; // TikTok icon eka wena library ekakin ganna

const ContactPage = () => {
  return (
    <div className={`${styles.pageContainer} container`}>
      <div className={styles.titleSection}>
        <h1>Get in Touch</h1>
        <p className={styles.subtitle}>We are here for you! How can we help?</p>
      </div>
      <div className={styles.contactWrapper}>
        <div className={styles.contactDetails}>
          <h3>Contact Information</h3>
          <p>Fill up the form and our team will get back to you within 24 hours.</p>
          <a href="tel:+94706004033" className={styles.infoLine}>
            <FiPhone /><span>+94 70 600 4033 (Hotline)</span>
          </a>
          <a href="mailto:rapidgo.deliverysl@gmail.com" className={styles.infoLine}>
            <FiMail /><span>rapidgo.deliverysl@gmail.com</span>
          </a>
          <div className={styles.infoLine}>
            <FiMapPin /><span>Kaduwela, Sri Lanka</span>
          </div>
          <div className={styles.socialIcons}>
            <a href="#" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
            <a href="https://wa.me/94706004033" target="_blank" rel="noopener noreferrer"><FiMessageCircle /></a>
          </div>
        </div>
        <form className={styles.contactForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="example@email.com" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Your Message" rows="5" required></textarea>
          </div>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;