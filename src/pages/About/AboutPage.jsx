import React from 'react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={`${styles.pageContainer} container`}>
      <h1>About RapidGo</h1>
      <p className={styles.subtitle}>Your trusted partner for fast, reliable, and affordable delivery.</p>
      <div className={styles.content}>
        <h2>Our Story</h2>
        <p>
          Founded in 2025, RapidGo was born out of a simple idea: to make everyday life easier by connecting people with their local stores. We saw a need for a fast, reliable delivery service that could handle everything from daily groceries to urgent pharmacy needs. Today, we are proud to serve thousands of customers across the island.
        </p>
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide a seamless and efficient delivery experience, powered by technology and a commitment to customer satisfaction. We aim to empower local businesses and provide our customers with convenience and peace of mind.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;