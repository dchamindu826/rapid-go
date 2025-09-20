import React, { useState, useEffect } from 'react';
import styles from './ShopCtaSection.module.css';
import { Link } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient'; 
// Swiper components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
// Swiper CSS
import 'swiper/css';

const ShopCtaSection = () => {
    const [latestProducts, setLatestProducts] = useState([]);

    useEffect(() => {
        const query = `*[_type == "product"] | order(_createdAt desc)[0...5]{
            _id,
            name,
            price,
            images,
            slug
        }`;
        client.fetch(query).then(data => {
            setLatestProducts(data);
        });
    }, []);

    const getImageUrl = (image) => {
        if (!image?.asset?._ref) {
            return 'https://placehold.co/400x300/1E293B/E2E8F0?text=No+Image';
        }
        return urlFor(image).width(400).height(300).url();
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
                        const displayImage = product.images?.[0];
                        return (
                            <SwiperSlide key={product._id} className={styles.swiperSlide}>
                                <Link to={`/product/${product.slug?.current}`} className={styles.productCard}>
                                    <img src={getImageUrl(displayImage)} alt={product.name} className={styles.cardImage} />
                                    <div className={styles.cardContent}>
                                        <h3>{product.name}</h3>
                                        <span className={styles.price}>Rs. {product.price?.toFixed(2) || '0.00'}</span>
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