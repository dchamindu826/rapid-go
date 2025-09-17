import React from 'react';
import styles from './ThankYouPage.module.css';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const ThankYouPage = () => {
  return (
    <div className={`${styles.pageContainer} container`}>
      <div className={styles.thankYouBox}>
        <FiCheckCircle className={styles.successIcon} />
        <h1>Thank You for Your Order!</h1>
        <p className={styles.subtitle}>
          Your order has been placed successfully and is now pending approval. 
          We will review your payment proof shortly. You can check the status on your profile page.
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/profile" className={styles.btn}>View My Orders</Link>
          <Link to="/shop" className={styles.btnSecondary}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; // This line was missing