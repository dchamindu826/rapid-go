import React, { useState, useEffect } from 'react';
import styles from './HeroSection.module.css';
import { Link } from 'react-router-dom';

// Hero section ekata daanna ona images wala paths me array ekata daanna
const heroImages = [
    '/images/hero/rider-1.png',
    '/images/hero/rider-2.png',
    '/images/hero/rider-3.png',
];

const HeroSection = () => {
    // Random image eka save karaganna state ekak hadanawa
    const [currentImage, setCurrentImage] = useState('');

    // Page eka load wenakota witharak me code eka run wenawa
    useEffect(() => {
        // heroImages array eken random widiyata ekak thoragannawa
        const randomIndex = Math.floor(Math.random() * heroImages.length);
        setCurrentImage(heroImages[randomIndex]);
    }, []); // Me [] nisa meka reload weddi witharak run wenne

    return (
        <section className={`${styles.hero} container`}>
            <div className={styles.heroContent}>
                <p className={styles.heroTagline}>FAST & RELIABLE</p>
                <h1 className={styles.heroTitle}>Your Daily Essentials, Delivered in Minutes.</h1>
                <p className={styles.heroSubtitle}>Craving food or need medicine in a hurry? RapidGo brings your favorite stores right to your doorstep, faster than ever.</p>
                <Link to="/shop">
                  <button className={styles.btn}>Place an Order</button>
                </Link>
            </div>
            <div className={styles.heroImageContainer}>
                {/* Random image eka methanin pennanawa */}
                {currentImage && <img src={currentImage} alt="Delivery Rider" className={styles.heroImage} />}
            </div>
        </section>
    );
};

export default HeroSection;