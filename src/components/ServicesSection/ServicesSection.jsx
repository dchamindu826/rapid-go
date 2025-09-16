import React from 'react';
import styles from './ServicesSection.module.css';

const servicesData = [
  {
    title: 'Same-Day Delivery',
    description: 'Need it fast? Our express delivery service gets your package to its destination within the same day.',
    img: '/images/services/sameday.png',
  },
  {
    title: 'Live Tracking',
    description: 'Stay updated with real-time tracking, SMS alerts, and delivery notifications so you’re always in the loop.',
    img: '/images/services/livetracking.png',
  },
  // ... (anith services walatath me widiyatama local paths daanna)
  {
    title: 'Cash on Delivery (COD)',
    description: 'We handle cash payments securely on behalf of businesses and remit funds directly to your account.',
    img: '/images/services/cod.png',
  },
  {
    title: 'Bulk Shipping',
    description: 'Custom solutions for corporate clients, retailers, and e-commerce stores, ensuring seamless logistics.',
    img: '/images/services/bulk.png',
  },
  {
    title: 'Door-to-Door Courier',
    description: 'We pick up from your location and deliver straight to the recipient’s doorstep, ensuring ultimate convenience.',
    img: '/images/services/doortodoor.png',
  },
  {
    title: 'API & eCommerce Plugins',
    description: 'Easily integrate with Shopify, WooCommerce, and other platforms for automated shipping.',
    img: '/images/services/api.png',
  },
];

const ServiceCard = ({ title, description, img }) => (
  <div className={styles.card}>
    <img src={img} alt={title} className={styles.cardIcon} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const ServicesSection = () => {
  return (
    <section className={styles.services}>
      <div className="container">
        <h2 className={styles.sectionTitle}>A Wide Range of Delivery Solutions</h2>
        <p className={styles.sectionSubtitle}>For individuals, businesses, and e-commerce platforms.</p>
        <div className={styles.servicesGrid}>
          {servicesData.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;