import React from 'react';
import styles from './HeroSection.module.css';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.videoBackground}>
                <video autoPlay loop muted playsInline key="/videos/delivery-video.mp4">
                    <source src="/videos/delivery-video.mp4" type="video/mp4" />
                </video>
            </div>

            <div className={`container ${styles.heroContainer}`}>
                <div className={styles.heroContent}>
                    <p className={styles.heroTagline}>FAST & RELIABLE</p>
                    <h1 className={styles.heroTitle}>Your Trusted Courier & Delivery Partner.</h1>
                    <p className={styles.heroSubtitle}>One click, and we deliver parcels and groceries directly to your doorstep.</p>
                    <Link to="/shop">
                        <button className={styles.btn}>Place an Order</button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;