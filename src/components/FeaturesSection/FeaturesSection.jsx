import React from 'react';
import styles from './FeaturesSection.module.css';

const featuresData = [
  {
    number: '01',
    title: 'Fast & Reliable',
    description: 'Speed you can trust! Our advanced logistics network ensures timely and secure deliveries, no matter the destination.',
    color: 'blue',
  },
  {
    number: '02',
    title: 'Affordable Pricing',
    description: 'Competitive rates with no hidden fees. Enjoy budget-friendly shipping solutions for individuals and businesses alike.',
    color: 'dark',
  },
  {
    number: '03',
    title: 'API & eCommerce Plugins',
    description: 'Seamlessly integrate our shipping API with your Shopify, WooCommerce, or custom platform.',
    color: 'dark',
  },
  {
    number: '04',
    title: 'E-Commerce Friendly',
    description: 'Designed for online businesses, we offer COD, bulk shipping, and easy return management.',
    color: 'blue',
  },
  {
    number: '05',
    title: 'Live Tracking',
    description: 'Know exactly where your parcel is at all times with our real-time tracking system.',
    color: 'blue',
  },
  {
    number: '06',
    title: '24/7 Customer Support',
    description: 'Our dedicated support team ensures your queries are answered quickly and efficiently.',
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