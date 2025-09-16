import React from 'react';
import styles from './ShowcaseSection.module.css';

const ProductCard = ({ title, description }) => (
    <div className={styles.productCard}>
        <div className={styles.productImage}></div>
        <h3>{title}</h3>
        <p>{description}</p>
        <button className={styles.btn}>Shop Now</button>
    </div>
);

const ShowcaseSection = () => (
    <section className={styles.showcase}>
        <div className="container">
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <div className={styles.showcaseGrid}>
                <ProductCard title="Fresh Groceries" description="Quality produce, delivered fresh." />
                <ProductCard title="Pharmacy" description="Medicines and wellness products." />
                <ProductCard title="Restaurants" description="Your favorite local food spots." />
            </div>
        </div>
    </section>
);

export default ShowcaseSection;