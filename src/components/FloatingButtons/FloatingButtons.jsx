import React from 'react';
import styles from './FloatingButtons.module.css';
import { FiPhone, FiMessageCircle } from 'react-icons/fi';

const FloatingButtons = () => {
  return (
    <div className={styles.container}>
      {/* --- WhatsApp Button --- */}
      <a 
        href="https://wa.me/94706004025" // Parcel Delivery number for WhatsApp
        className={styles.whatsappBtn} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <FiMessageCircle />
      </a>
      {/* --- Call Button --- */}
      <a 
        href="tel:+94706004033" // Hotline number for calls
        className={styles.callBtn}
        aria-label="Call Hotline"
      >
        <FiPhone />
      </a>
    </div>
  );
};

export default FloatingButtons;