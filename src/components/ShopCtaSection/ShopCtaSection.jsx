import React, { useState, useEffect } from 'react';
import styles from './ShopCtaSection.module.css';
import { Link } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient';
// Swiper components import karaganna
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
// Swiper CSS import karaganna
import 'swiper/css';

const ShopCtaSection = () => {
    const [latestProducts, setLatestProducts] = useState([]);

    useEffect(() => {
        // Aluthma products 6k fetch karanawa slider ekata
        const query = '*[_type == "product"] | order(_createdAt desc)[0...5]';
        client.fetch(query).then(data => {
            setLatestProducts(data);
        });
    }, []);

    const getImageUrl = (mediaItem) => {
        if (!mediaItem) return '';
        if (mediaItem._type === 'image' && mediaItem.asset) {
            return urlFor(mediaItem).width(400).height(300).url();
        }
        if (mediaItem._type === 'imageUrl' && mediaItem.url) {
            return mediaItem.url;
        }
        return '';
    };

    return (
        <section className={styles.ctaSection}>
            <div className="container">
                <h2 className={styles.title}>Latest Digital Products</h2>
            </div>
            <div className={styles.swiperContainer}>
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView={'auto'}
                    loop={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                >
                    {latestProducts.map(product => {
                        const displayImage = product.productMedia?.find(media => media._type === 'image' || media._type === 'imageUrl');
                        return (
                            <SwiperSlide key={product._id} className={styles.swiperSlide}>
                                <Link to={`/product/${product.slug.current}`} className={styles.productCard}>
                                    <img src={getImageUrl(displayImage)} alt={product.name} className={styles.cardImage} />
                                    <div className={styles.cardContent}>
                                        <h3>{product.name}</h3>
                                        <span className={styles.price}>Rs. {product.price.toFixed(2)}</span>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>
        </section>
    );
};

export default ShopCtaSection;