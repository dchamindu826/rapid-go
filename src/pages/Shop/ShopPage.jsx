import React, { useState } from 'react';
import styles from './ShopPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

// Sample product data
const products = [
    { id: 1, category: 'Pharmacy', name: 'Panadol (24 Tablets)', price: 120.00, rating: 5, img: '/images/products/panadol.png' },
    { id: 2, category: 'Pharmacy', name: 'Vitamin C (100 Capsules)', price: 750.00, rating: 4, img: '/images/products/vitamin-c.png' },
    { id: 3, category: 'Pharmacy', name: 'Digital Thermometer', price: 900.00, rating: 5, img: '/images/products/thermometer.png' },
    { id: 4, category: 'Pharmacy', name: 'Hand Sanitizer', price: 350.00, rating: 4, img: '/images/products/sanitizer.png' },
    { id: 5, category: 'Groceries', name: 'Fresh Milk (1L)', price: 480.00, rating: 5, img: '/images/products/milk.png' },
    { id: 6, category: 'Groceries', name: 'Brown Bread', price: 320.00, rating: 4, img: '/images/products/bread.png' },
    { id: 7, category: 'Groceries', name: 'Organic Eggs (12)', price: 600.00, rating: 5, img: '/images/products/eggs.png' },
    { id: 8, category: 'Groceries', name: 'Basmati Rice (1kg)', price: 850.00, rating: 4, img: '/images/products/rice.png' },
];
const categories = ['All Products', 'Pharmacy', 'Groceries', 'Restaurants'];

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className={styles.productCard}>
            <Link to={`/product/${product.id}`} className={styles.productLink}>
                <div className={styles.productImageWrapper}>
                    <img src={product.img} alt={product.name} />
                </div>
                <div className={styles.productInfo}>
                    <span className={styles.category}>{product.category}</span>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.rating}>{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</div>
                    <div className={styles.price}>Rs. {product.price.toFixed(2)}</div>
                </div>
            </Link>
            <div className={styles.productAction}>
                 <button 
                    className={styles.addToCartBtn} 
                    onClick={() => addToCart(product)}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

const ShopPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Products');

    const filteredProducts = products
        .filter(product => 
            selectedCategory === 'All Products' || product.category === selectedCategory
        )
        .filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className={`${styles.shopPage} container`}>
            <header className={styles.shopHeader}>
                <h1>Explore Our Products</h1>
                <div className={styles.searchBar}>
                    <input 
                        type="text" 
                        placeholder="Search for products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </header>
            
            <main className={styles.shopContent}>
                <aside className={styles.filters}>
                    <h4>Categories</h4>
                    <ul>
                        {categories.map(category => (
                            <li 
                                key={category}
                                className={selectedCategory === category ? styles.active : ''}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </li>
                        ))}
                    </ul>
                </aside>
                <div className={styles.productGrid}>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
        </div>
    );
};
export default ShopPage