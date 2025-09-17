import React, { useState, useEffect } from 'react';
import styles from './ShopPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FiTag, FiVideo, FiMonitor, FiCamera, FiLayout } from 'react-icons/fi';
import { client, urlFor } from '../sanityClient';

const categoryIcons = { 'All': <FiTag />, 'Video': <FiVideo />, 'Web': <FiMonitor />, 'PSD': <FiLayout />, 'Preset': <FiCamera /> };

const getMediaUrl = (mediaItem) => {
    if (!mediaItem) return null;
    if (mediaItem._type === 'image' && mediaItem.asset) { return urlFor(mediaItem).height(300).url(); }
    if (mediaItem._type === 'imageUrl' && mediaItem.url) { return mediaItem.url; }
    return null;
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const displayImage = product.productMedia?.find(item => item._type === 'image' || item._type === 'imageUrl');

    return (
        <div className={styles.productCard}>
            <Link to={`/product/${product.slug.current}`} className={styles.productLink}>
                <div className={styles.productImageWrapper}>
                    {displayImage && ( <img src={getMediaUrl(displayImage)} alt={product.name} /> )}
                    <div className={styles.categoryBadge}>{product.category?.title || 'General'}</div>
                </div>
                <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.price}>Rs. {product.price?.toFixed(2)}</div>
                </div>
            </Link>
            <div className={styles.productAction}>
                 <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
        </div>
    );
};

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            const productQuery = '*[_type == "product"]{_id, name, price, "category": category->{title}, productMedia, slug}';
            const categoryQuery = '*[_type == "category"]';
            try {
                const sanityProducts = await client.fetch(productQuery);
                const sanityCategories = await client.fetch(categoryQuery);
                setProducts(sanityProducts);
                setCategories([{title: 'All'}, ...sanityCategories]);
            } catch (error) { console.error("Failed to fetch from Sanity:", error); }
            finally { setIsLoading(false); }
        };
        fetchContent();
    }, []);

    const filteredProducts = products
        .filter(product => selectedCategory === 'All' || product.category?.title === selectedCategory)
        .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`${styles.shopPage} container`}>
            <header className={styles.shopHeader}>
                <h1>Digital Products</h1>
                <p className={styles.subtitle}>High-quality templates, presets, and assets to supercharge your creative projects.</p>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Search for templates, presets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {/* --- SVG eke code eka harigassala thiyenne --- */}
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </header>
            
            <main className={styles.shopContent}>
                 <div className={styles.filterBar}>
                    {categories.map(category => (
                        <button key={category.title} className={`${styles.filterBtn} ${selectedCategory === category.title ? styles.active : ''}`} onClick={() => setSelectedCategory(category.title)}>
                            {categoryIcons[category.title]}
                            {category.title}
                        </button>
                    ))}
                </div>
                
                {isLoading ? (
                    <div className={styles.loader}>Loading Products...</div>
                ) : (
                    <div className={styles.productGrid}>
                        {filteredProducts.map(product => ( <ProductCard key={product._id} product={product} /> ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShopPage;