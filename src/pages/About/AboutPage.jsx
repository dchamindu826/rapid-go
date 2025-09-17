import React from 'react';
import styles from './AboutPage.module.css';
import { FiFastForward, FiShield, FiSmile } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className={styles.pageContainer}>
      <section className={`${styles.hero} container`}>
        <h1>About RapidGo</h1>
        <p className={styles.subtitle}>We are more than just a delivery service. We are your reliable partner in connecting you to what you need, when you need it.</p>
      </section>

      <section className={`${styles.ourValues} container`}>
        <h2>Our Core Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <FiFastForward />
            <h3>Speed</h3>
            <p>We are obsessed with speed. Our logistics network is optimized for the fastest possible delivery times.</p>
          </div>
          <div className={styles.valueCard}>
            <FiShield />
            <h3>Reliability</h3>
            <p>Your trust is our priority. We handle every package with care and ensure it reaches its destination safely.</p>
          </div>
          <div className={styles.valueCard}>
            <FiSmile />
            <h3>Customer Focus</h3>
            <p>We are committed to providing an exceptional customer experience, from easy ordering to real-time support.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;