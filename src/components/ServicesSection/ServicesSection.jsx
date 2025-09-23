import React from 'react';
import styles from './ServicesSection.module.css';
import { Link } from 'react-router-dom';

const servicesData = [
  {
    icon: '📦',
    title: 'Parcel & Courier Service',
    description: 'Send your packages and documents with confidence. Fast, secure, and affordable delivery guaranteed.',
    link: '/create-order?type=parcel', // <-- ALUTH LINK EKA
    buttonText: 'Send a Parcel',
  },
  {
    icon: '🛒',
    title: 'Supermarket Grocery Delivery',
    description: 'Shop from top supermarkets like Cargills, Arpico, Keells & more - delivered fresh and fast.',
    link: '/create-order?type=grocery', // <-- ALUTH LINK EKA
    buttonText: 'Order Groceries',
  },
  {
    icon: '💊',
    title: 'Pharmacy Item Delivery',
    description: 'Get essential medicines and pharmacy products delivered safely and reliably. Your health, our priority.',
    link: '/create-order?type=pharmacy', // <-- ALUTH LINK EKA
    buttonText: 'Order Medicines',
  },
  {
    icon: '🍔',
    title: 'Restaurant Food Delivery',
    description: 'Enjoy hot, fresh meals from your nearest restaurants - delivered right to your door.',
    link: '/restaurants', // <-- ALUTH LINK EKA
    buttonText: 'Order Food',
  },
  {
    icon: '💻',
    title: 'Digital Products',
    description: 'Get instant access to our exclusive collection of digital assets, tools, and creative packs.',
    link: '/shop', // Meka /shop ekatama thiyenna one
    buttonText: 'Browse Products',
  },
];

const ServiceCard = ({ icon, title, description, link, buttonText }) => (
  <div className={styles.card}>
    <div className={styles.cardIcon}>{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link to={link} className={styles.ctaButton}>
        {buttonText}
    </Link>
  </div>
);

const ServicesSection = () => {
  return (
    <section className={styles.services}>
      <div className="container">
        <h2 className={styles.sectionTitle}>All Your Delivery Needs, in One Place</h2>
        <p className={styles.sectionSubtitle}>From your daily essentials to important parcels, we've got you covered.</p>
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