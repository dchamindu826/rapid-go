import React, { useState, useEffect } from 'react';
import styles from './HeroSection.module.css';
import { Link } from 'react-router-dom';

const heroImages = [
    '/images/hero/rider-1.png',
    '/images/hero/rider-2.png',
    '/images/hero/rider-3.png',
];

const HeroSection = () => {
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * heroImages.length);
        setCurrentImage(heroImages[randomIndex]);
    }, []);

    return (
        <section className={`${styles.hero} container`}>
            {/* --- Aluth Background Video eka --- */}
            <div className={styles.videoBackground}>
                <video autoPlay loop muted playsInline>
                    <source src="/videos/hero-background.mp4" type="video/mp4" />
                </video>
            </div>

            <div className={styles.heroContent}>
                <p className={styles.heroTagline}>FAST & RELIABLE</p>
                <h1 className={styles.heroTitle}>Your Daily Essentials, Delivered in Minutes.</h1>
                <p className={styles.heroSubtitle}>Craving food or need medicine in a hurry? RapidGo brings your favorite stores right to your doorstep, faster than ever.</p>
                <Link to="/shop">
                  <button className={styles.btn}>Place an Order</button>
                </Link>
            </div>
            <div className={styles.heroImageContainer}>
                {currentImage && <img src={currentImage} alt="Delivery Rider" className={styles.heroImage} />}
            </div>
        </section>
    );
};

export default HeroSection;