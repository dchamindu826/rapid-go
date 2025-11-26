// src/pages/MenuPage/MenuPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { Search, Plus, Star, Clock, X, ShoppingBag, ChevronRight } from 'lucide-react';
import styles from './MenuPage.module.css';
import CheckoutModal from './CheckoutModal';

const MenuPage = () => {
    const { slug } = useParams();
    const { addToCart, cartItems, cartTotal } = useFoodCart();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Variation Selection States
    const [selectedItemForVar, setSelectedItemForVar] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState(null);

    // Scroll Detection for Floating Cart (Footer Overlay Fix)
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const pageWrapperRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restaurantQuery = `*[_type == "restaurant" && slug.current == $slug][0]`;
                const restaurantData = await client.fetch(restaurantQuery, { slug });
                setRestaurant(restaurantData);

                if (restaurantData) {
                    const menuQuery = `*[_type == "menuItem" && restaurant._ref == $restoId] {
                        _id, name, description, image, price, variations,
                        "categoryName": category->name
                    }`;
                    const menuData = await client.fetch(menuQuery, { restoId: restaurantData._id });
                    setMenuItems(menuData);

                    const uniqueCategories = ['All', ...new Set(menuData.map(item => item.categoryName).filter(Boolean))];
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    // Enhanced Scroll Logic to detect Footer
    useEffect(() => {
        const handleScroll = () => {
            if (!pageWrapperRef.current) return;

            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;
            
            // Footer Height assumption (adjust 300 if your footer is bigger/smaller)
            const footerOffset = 300; 

            // Check if we are near bottom
            if (scrollY + windowHeight >= fullHeight - footerOffset) {
                setIsFooterVisible(true);
            } else {
                setIsFooterVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || item.categoryName === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [menuItems, searchQuery, activeCategory]);

    const handleItemClick = (item) => {
        if (item.variations && item.variations.length > 0) {
            setSelectedItemForVar(item);
            setSelectedVariation(item.variations[0]);
        } else {
            addToCart(item);
        }
    };

    const confirmVariationAdd = () => {
        if (selectedItemForVar && selectedVariation) {
            const cartItem = {
                ...selectedItemForVar,
                _id: `${selectedItemForVar._id}-${selectedVariation._key}`,
                name: `${selectedItemForVar.name} (${selectedVariation.size})`,
                price: selectedVariation.price
            };
            addToCart(cartItem);
            setSelectedItemForVar(null);
        }
    };

    const getPriceDisplay = (item) => {
        if (item.price) return `Rs. ${item.price.toFixed(2)}`;
        if (item.variations && item.variations.length > 0) {
            const minPrice = Math.min(...item.variations.map(v => v.price));
            return `From Rs. ${minPrice.toFixed(0)}`;
        }
        return '';
    };

    if (loading) return <div className={styles.loader}>Loading Menu...</div>;
    if (!restaurant) return <div className={styles.loader}>Restaurant not found.</div>;

    return (
        <div className={styles.pageWrapper} ref={pageWrapperRef}>

            {/* --- 1. HERO HEADER (Creative Design) --- */}
            <div className={styles.heroHeader}>
                <div className={styles.headerContent}>
                    {restaurant.logo ? (
                        <img src={urlFor(restaurant.logo).url()} alt={restaurant.name} className={styles.logoImg} />
                    ) : (
                        <div className={styles.placeholderLogo}>{restaurant.name.charAt(0)}</div>
                    )}
                    <div className={styles.restaurantDetails}>
                        <h1>{restaurant.name}</h1>
                        <p>{restaurant.description || "Fresh food, delivered fast."}</p>
                        <div className={styles.badges}>
                            <span><Clock size={14} /> 30 min</span>
                            <span><Star size={14} fill="#FACC15" color="#FACC15" /> 4.8</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. STICKY SEARCH & TABS --- */}
            <div className={styles.stickyNav}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={`Search in ${restaurant.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.tabs}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.tabBtn} ${activeCategory === cat ? styles.activeTab : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 3. CREATIVE MENU GRID --- */}
            <div className={styles.menuGrid}>
                {filteredItems.map(item => (
                    <div key={item._id} className={styles.foodCard} onClick={() => handleItemClick(item)}>
                        <div className={styles.cardImage}>
                            {item.image ? (
                                <img src={urlFor(item.image).width(300).height(200).url()} alt={item.name} />
                            ) : (
                                <div className={styles.noImage}><ShoppingBag size={30} /></div>
                            )}
                            <button className={styles.addBtn}><Plus size={18} /></button>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderRow}>
                                <h3>{item.name}</h3>
                                <span className={styles.price}>{getPriceDisplay(item)}</span>
                            </div>
                            <p className={styles.desc}>{item.description}</p>

                            {/* Variations Badges */}
                            {item.variations && item.variations.length > 0 && (
                                <div className={styles.tags}>
                                    {item.variations.map(v => (
                                        <span key={v._key} className={styles.sizeTag}>{v.size}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- 4. FLOATING CART (Footer Fix Applied) --- */}
            {cartItems.length > 0 && (
                <div
                    className={`${styles.floatingCart} ${isFooterVisible ? styles.floatingCartAbsolute : ''}`}
                    onClick={() => setIsCheckoutOpen(true)}
                >
                    <div className={styles.cartLeft}>
                        <div className={styles.countBadge}>{cartItems.length}</div>
                        <span>View Cart</span>
                    </div>
                    <div className={styles.cartRight}>
                        Rs. {cartTotal.toFixed(2)} <ChevronRight size={18} />
                    </div>
                </div>
            )}

            {/* --- 5. VARIATION MODAL --- */}
            {selectedItemForVar && (
                <div className={styles.modalOverlay}>
                    <div className={styles.varModal}>
                        <div className={styles.varHeader}>
                            <h3>Select Size</h3>
                            <button onClick={() => setSelectedItemForVar(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.varBody}>
                            <p style={{marginBottom: '10px', color:'#888', fontSize:'0.9rem'}}>Required • Choose 1</p>
                            {selectedItemForVar.variations.map(v => (
                                <label key={v._key} className={`${styles.varOption} ${selectedVariation?._key === v._key ? styles.selectedOption : ''}`}>
                                    <div className={styles.radioGroup}>
                                        <input
                                            type="radio"
                                            name="size"
                                            checked={selectedVariation?._key === v._key}
                                            onChange={() => setSelectedVariation(v)}
                                        />
                                        <span className={styles.varName}>{v.size}</span>
                                    </div>
                                    <span className={styles.varPrice}>+ Rs.{v.price}</span>
                                </label>
                            ))}
                        </div>
                        <div className={styles.varFooter}>
                            <button className={styles.addToOrderBtn} onClick={confirmVariationAdd}>
                                Add • Rs. {selectedVariation?.price}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 6. CHECKOUT MODAL --- */}
            {isCheckoutOpen && (
                <CheckoutModal
                    restaurant={restaurant}
                    onClose={() => setIsCheckoutOpen(false)}
                />
            )}
        </div>
    );
};

export default MenuPage;