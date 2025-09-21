// File eka: components/FeaturesSection/FeaturesSection.js

import React from 'react';
import styles from './FeaturesSection.module.css';

// --- Customer ge 'Why Choose' ha 'Mission' points walata data wenas karanna ---
const featuresData = [
  {
    number: '01',
    title: 'Fast & Reliable',
    description: 'Your time is valuable. We ensure your orders arrive on time, every time, with the utmost care.',
    color: 'blue',
  },
  {
    number: '02',
    title: 'Wide Coverage',
    description: 'We are expanding! Serving major cities and suburbs across Sri Lanka to bring essentials closer to you.',
    color: 'dark',
  },
  {
    number: '03',
    title: 'Variety of Services',
    description: 'Groceries, pharmacy, food, and parcels — get everything you need delivered from one single platform.',
    color: 'dark',
  },
  {
    number: '04',
    title: 'Customer-Focused',
    description: 'Your convenience is our priority. Enjoy easy ordering, transparent pricing, and real-time updates on your delivery.',
    color: 'blue',
  },
  {
    number: '05',
    title: 'Our Mission: Quality',
    description: 'To deliver all items quickly, safely, and reliably, while ensuring freshness, quality, and care in every single delivery.',
    color: 'blue',
  },
  {
    number: '06',
    title: 'Our Mission: Innovation',
    description: 'To provide exceptional customer service and continuously innovate our services to meet your evolving needs.',
    color: 'dark',
  },
];

const FeatureCard = ({ number, title, description, color }) => (
  <div className={`${styles.card} ${color === 'blue' ? styles.blue : styles.dark}`}>
    <span className={styles.cardNumber}>{number}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const FeaturesSection = () => {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Why Choose RapidGo?</h2>
        <div className={styles.featuresGrid}>
          {featuresData.map((feature) => (
            <FeatureCard key={feature.number} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;