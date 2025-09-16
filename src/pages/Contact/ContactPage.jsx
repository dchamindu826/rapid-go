import React from 'react';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  return (
    <div className={`${styles.pageContainer} container`}>
      <h1>Contact Us</h1>
      <p className={styles.subtitle}>Have a question or feedback? We'd love to hear from you.</p>
      <div className={styles.contactWrapper}>
        <form className={styles.contactForm}>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="6" required></textarea>
          <button type="submit">Send Message</button>
        </form>
        <div className={styles.contactDetails}>
          <h3>Get in Touch</h3>
          <p><strong>Address:</strong> 123, Galle Road, Colombo 03, Sri Lanka</p>
          <p><strong>Phone:</strong> +94 11 234 5678</p>
          <p><strong>Email:</strong> support@rapidgo.lk</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;