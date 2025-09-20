import React, { useState, useEffect } from 'react';
import styles from './ShopPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { client, urlFor } from '../sanityClient';
import { FiTag, FiVideo, FiMonitor, FiCamera, FiLayout } from 'react-icons/fi';

const categoryIcons = {
    'All': <FiTag />,
    'Video Templates': <FiVideo />,
    'Web Themes': <FiMonitor />,
    'LUTs Pack': <FiCamera />,
    'Presets': <FiLayout />,
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const displayImage = product.images?.[0];

    const getImageUrl = (image) => {
        if (!image?.asset?._ref) {
            return 'https://placehold.co/400x300/1E293B/E2E8F0?text=No+Image';
        }
        return urlFor(image).width(400).url();
    };

    return (
        <div className={styles.productCard}>
            <Link to={`/product/${product.slug.current}`} className={styles.productLink}>
                <div className={styles.productImageWrapper}>
                    <img src={getImageUrl(displayImage)} alt={product.name} />
                    <div className={styles.categoryBadge}>{product.category?.name || 'General'}</div>
                </div>
                <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.price}>Rs. {product.price?.toFixed(2)}</div>
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
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            const productQuery = `*[_type == "product"]{
                _id, 
                name, 
                price, 
                "category": category->{name}, 
                images, 
                slug
            }`;
            const categoryQuery = '*[_type == "category"]{name}';

            try {
                const sanityProducts = await client.fetch(productQuery);
                const sanityCategories = await client.fetch(categoryQuery);
                setProducts(sanityProducts);
                setCategories([{name: 'All'}, ...sanityCategories]);
            } catch (error) { 
                console.error("Failed to fetch from Sanity:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchContent();
    }, []);

    const filteredProducts = products
        .filter(product => selectedCategory === 'All' || product.category?.name === selectedCategory)
        .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`${styles.shopPage} container`}>
            <header className={styles.shopHeader}>
                <h1>Digital Products</h1>
                <p className={styles.subtitle}>High-quality templates, presets, and assets to supercharge your creative projects.</p>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Search for templates, presets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </header>
            
            <main className={styles.shopContent}>
                 <div className={styles.filterBar}>
                    {categories.map(category => (
                        <button key={category.name} className={`${styles.filterBtn} ${selectedCategory === category.name ? styles.active : ''}`} onClick={() => setSelectedCategory(category.name)}>
                            {categoryIcons[category.name] || <FiTag />}
                            {category.name}
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