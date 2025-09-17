import React from 'react';
import styles from './ShopCtaSection.module.css';
import { Link } from 'react-router-dom';

const ctaData = [
    { title: 'Video Templates', img: '/images/cta/video.png', link: '/shop' },
    { title: 'Web Templates', img: '/images/cta/web.png', link: '/shop' },
    { title: 'Graphic Presets', img: '/images/cta/presets.png', link: '/shop' },
];

const ShopCtaSection = () => {
    return (
        <section className={`${styles.ctaSection} container`}>
            <h2 className={styles.title}>Latest Digital Products</h2>
            <div className={styles.ctaGrid}>
                {ctaData.map(item => (
                    <Link to={item.link} key={item.title} className={styles.ctaCard}>
                        <img src={item.img} alt={item.title} />
                        <h3>{item.title}</h3>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ShopCtaSection;