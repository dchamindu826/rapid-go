import React, { useState } from 'react';
import styles from './ShopPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { FiTag, FiVideo, FiMonitor, FiCamera, FiLayout } from 'react-icons/fi';

const digitalProducts = [
    { id: 9, category: 'Video', name: 'Corporate Slideshow Pack', price: 2500.00, rating: 5, img: '/images/products/digital/video1.jpg' },
    { id: 10, category: 'Web', name: 'Modern React Landing Page', price: 3000.00, rating: 5, img: '/images/products/digital/web1.jpg' },
    { id: 11, category: 'PSD', name: 'Business Card Mockup Set', price: 1200.00, rating: 4, img: '/images/products/digital/psd1.jpg' },
    { id: 12, category: 'Preset', name: 'Cinematic Lightroom Presets', price: 1500.00, rating: 5, img: '/images/products/digital/preset1.jpg' },
    { id: 13, category: 'Video', name: 'Dynamic Intro & Opener', price: 1800.00, rating: 4, img: '/images/products/digital/video2.jpg' },
    { id: 14, category: 'Web', name: 'E-commerce UI Kit', price: 4500.00, rating: 5, img: '/images/products/digital/web2.jpg' },
];

const categories = ['All', 'Video', 'Web', 'PSD', 'Preset'];
const categoryIcons = { 'All': <FiTag />, 'Video': <FiVideo />, 'Web': <FiMonitor />, 'PSD': <FiLayout />, 'Preset': <FiCamera /> };

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div className={styles.productCard}>
            <Link to={`/product/${product.id}`} className={styles.productLink}>
                <div className={styles.productImageWrapper}>
                    <img src={product.img} alt={product.name} />
                    <div className={styles.categoryBadge}>{product.category}</div>
                </div>
                <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.price}>Rs. {product.price.toFixed(2)}</div>
                </div>
            </Link>
            <div className={styles.productAction}>
                 <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

const ShopPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = digitalProducts
        .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
        .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`${styles.shopPage} container`}>
            <header className={styles.shopHeader}>
                <h1>Digital Products</h1>
                <p className={styles.subtitle}>High-quality templates, presets, and assets to supercharge your creative projects.</p>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Search for templates, presets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </header>
            
            <main className={styles.shopContent}>
                <div className={styles.filterBar}>
                    {categories.map(category => (
                        <button key={category} className={`${styles.filterBtn} ${selectedCategory === category ? styles.active : ''}`} onClick={() => setSelectedCategory(category)}>
                            {categoryIcons[category]}
                            {category}
                        </button>
                    ))}
                </div>
                <div className={styles.productGrid}>
                    {filteredProducts.map(product => ( <ProductCard key={product.id} product={product} /> ))}
                </div>
            </main>
        </div>
    );
};

export default ShopPage;