// File eka: pages/AboutPage/AboutPage.js
// Kalin code eka ain karala, me sampurna code eka danna.

import React from 'react';
import styles from './AboutPage.module.css';
import { FiTarget, FiStar, FiHeart, FiRefreshCw } from 'react-icons/fi';

// Mission card wala data tika wenama array ekakata gamu
const missionData = [
    {
        icon: <FiTarget />,
        title: "Reliable Delivery",
        description: "Deliver groceries, medicines, meals, and parcels quickly, safely, and reliably."
    },
    {
        icon: <FiStar />,
        title: "Exceptional Service",
        description: "Provide top-notch customer service with real-time updates and transparent pricing."
    },
    {
        icon: <FiHeart />,
        title: "Quality & Care",
        description: "Ensure freshness, quality, and meticulous care in every single delivery we handle."
    },
    {
        icon: <FiRefreshCw />,
        title: "Continuous Innovation",
        description: "Constantly innovate and improve our services to meet the evolving needs of our customers."
    }
];


const AboutPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.aboutSectionContainer} container`}>
        
        {/* --- About Us wisthare --- */}
        <div className={styles.aboutContent}>
          <h1>About RapidGo Delivery</h1>
          <p>
            RapidGo Delivery is Sri Lanka’s trusted delivery partner for all your needs — from 
            groceries and pharmacy items to restaurant meals and courier parcels. We make 
            life easier by bringing your essentials fast, fresh, and securely right to your doorstep.
          </p>
        </div>

        {/* --- Our Mission wisthare --- */}
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <div className={styles.missionGrid}>
            {missionData.map((item, index) => (
              <div key={index} className={styles.missionCard}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;