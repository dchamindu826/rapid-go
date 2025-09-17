import React from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductDetailPage.module.css';

const digitalProducts = [
    { id: 9, category: 'Video', name: 'Corporate Slideshow Pack', price: 2500.00, rating: 5, img: '/images/products/digital/video1.jpg', description: 'A professional and clean slideshow pack with smooth animations, perfect for corporate presentations, business meetings, and marketing videos.' },
    { id: 10, category: 'Web', name: 'Modern React Landing Page', price: 3000.00, rating: 5, img: '/images/products/digital/web1.jpg', description: 'A fully responsive, modern landing page template built with React and Vite. Easy to customize and deploy for your next project.' },
    { id: 11, category: 'PSD', name: 'Business Card Mockup Set', price: 1200.00, rating: 4, img: '/images/products/digital/psd1.jpg', description: 'A set of high-quality PSD mockups to showcase your business card designs in a realistic and professional manner.' },
    { id: 12, category: 'Preset', name: 'Cinematic Lightroom Presets', price: 1500.00, rating: 5, img: '/images/products/digital/preset1.jpg', description: 'A collection of professional Lightroom presets designed to give your photos a cinematic, moody, and consistent look.' },
    { id: 13, category: 'Video', name: 'Dynamic Intro & Opener', price: 1800.00, rating: 4, img: '/images/products/digital/video2.jpg', description: 'An energetic and dynamic opener for your videos, perfect for YouTube intros, event promotions, and more.' },
    { id: 14, category: 'Web', name: 'E-commerce UI Kit', price: 4500.00, rating: 5, img: '/images/products/digital/web2.jpg', description: 'A complete UI kit for Figma and Sketch, designed for modern e-commerce websites. Includes hundreds of components and screens.' },
];

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addToCart } = useCart();
    const product = digitalProducts.find(p => p.id === parseInt(productId));

    if (!product) {
        return <div className="container" style={{padding: '50px', textAlign:'center'}}><h2>Product not found!</h2></div>;
    }

    return (
        <div className={`${styles.productPage} container`}>
            <div className={styles.productLayout}>
                <div className={styles.productImage}>
                    <img src={product.img} alt={product.name} />
                </div>
                <div className={styles.productDetails}>
                    <span className={styles.category}>{product.category}</span>
                    <h1>{product.name}</h1>
                    <div className={styles.rating}>{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</div>
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.price}>Rs. {product.price.toFixed(2)}</div>
                    <div className={styles.actions}>
                        <input type="number" defaultValue="1" min="1" className={styles.quantity} />
                        <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;