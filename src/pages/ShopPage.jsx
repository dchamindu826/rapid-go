import React, { useState, useEffect, useMemo } from 'react';
import styles from './ShopPage.module.css';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { client, urlFor } from '../sanityClient';
import { FiTag, FiVideo, FiMonitor, FiCamera, FiLayout } from 'react-icons/fi';

// ... (ProductCard component එක මෙතන තියෙන්න ඕන, ඒකේ වෙනසක් නෑ)
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
                    {/* මෙතන Sub-category එකේ නම පෙන්නමු */}
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
    const [selectedMainCategory, setSelectedMainCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            // Product query එකේ category details ගන්න විදිහ වෙනස් කරනවා
            const productQuery = `*[_type == "product"]{
    _id, 
    name, 
    price, 
    "category": category->{_id, name, "parent": parent->{_id, name}}, 
    slug,
    "images": images[]{_key, asset} 
}`;
            // Category query එකේ parent details ගන්නවා
            const categoryQuery = `*[_type == "category"]{
                _id,
                name,
                "parent": parent->{_id, name}
            }`;

            try {
                const sanityProducts = await client.fetch(productQuery);
                const sanityCategories = await client.fetch(categoryQuery);
                setProducts(sanityProducts);
                setCategories(sanityCategories);
                 console.log("Products:", sanityProducts);
                 console.log("Categories:", sanityCategories);
            } catch (error) { 
                console.error("Failed to fetch from Sanity:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchContent();
    }, []);

    const mainCategories = useMemo(() => {
    const main = [{ _id: 'All', name: 'All' }];
    categories.forEach(cat => {
        if (!cat.parent) {
            main.push(cat);
        }
    });
    return main;
}, [categories]);

const subCategoriesByParent = useMemo(() => {
    const subByParent = {};
    categories.forEach(cat => {
        if (cat.parent) {
            if (!subByParent[cat.parent._id]) {
                subByParent[cat.parent._id] = [];
            }
            subByParent[cat.parent._id].push(cat);
        }
    });
    return subByParent;
}, [categories]);

    // Filter Logic එක අලුතෙන් හදනවා
    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                if (selectedMainCategory === 'All') return true;
                if (selectedSubCategory) {
                    return p.category?._id === selectedSubCategory;
                }
                // Main category එකක් select කළාම ඒකෙ sub categories වල products පෙන්නනවා
                const parentId = p.category?.parent?._id || p.category?._id;
                return parentId === selectedMainCategory;
            })
            .filter(p => 
                p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, searchTerm, selectedMainCategory, selectedSubCategory]);
    
    const handleMainCategoryClick = (catId) => {
        setSelectedMainCategory(catId);
        setSelectedSubCategory(null); // Main category මාරු කරද්දී sub category reset කරනවා
    };

    return (
        <div className={`${styles.shopPage} page-wrapper container`}>
            <header className={styles.shopHeader}>
                <h1>Digital Products</h1>
                <p className={styles.subtitle}>High-quality templates, presets, and assets to supercharge your creative projects.</p>
                <div className={styles.searchBar}>
                     <input type="text" placeholder="Search for templates, presets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                     {/* ... search icon svg ... */}
                </div>
            </header>
            
            <main className={styles.shopContent}>
                 {/* Main Categories Filter */}
                <div className={styles.filterBar}>
                    {mainCategories.map(category => (
                        <button 
                            key={category._id} 
                            className={`${styles.filterBtn} ${selectedMainCategory === category._id ? styles.active : ''}`} 
                            onClick={() => handleMainCategoryClick(category._id)}>
                            {/* Icons ටික ඔයාට ඕන විදිහට දාගන්න */}
                            {category.name}
                        </button>
                    ))}
                </div>
                
                {/* Sub Categories Filter - Main එකක් select කළාම පෙන්නනවා */}
                {selectedMainCategory !== 'All' && subCategoriesByParent[selectedMainCategory] && (
                    <div className={`${styles.filterBar} ${styles.subFilterBar}`}>
                        {subCategoriesByParent[selectedMainCategory].map(category => (
                             <button 
                                key={category._id} 
                                className={`${styles.filterBtn} ${selectedSubCategory === category._id ? styles.active : ''}`} 
                                onClick={() => setSelectedSubCategory(category._id)}>
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}
                
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