import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient';
import { useFoodCart } from '../../contexts/FoodCartContext';
import { Search, Plus, Star, Clock, X, ShoppingBag, ChevronRight, AlertTriangle } from 'lucide-react';
import styles from './MenuPage.module.css';
import CheckoutModal from './CheckoutModal';

const MenuPage = () => {
    const { slug } = useParams();
    const { addToCart, cartItems, cartTotal, cartRestaurantId, clearCart } = useFoodCart();

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

    // Scroll Detection for Floating Cart
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const pageWrapperRef = useRef(null);

    // --- CONFLICT HANDLING STATE ---
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

    // --- SCROLL TO TOP FIX (ADDED ONLY THIS) ---
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

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

    useEffect(() => {
        const handleScroll = () => {
            if (!pageWrapperRef.current) return;
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;
            const footerOffset = 350; 

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

    // --- LOGIC FIX: Check Restaurant Mismatch on Add ---
    const handleAddToCartSafe = (item, isVariation = false) => {
        if (cartItems.length === 0) {
            addToCart(item, restaurant._id);
            return;
        }
        if (cartRestaurantId && cartRestaurantId !== restaurant._id) {
            setPendingItemToAdd(item);
            setShowConflictModal(true);
        } else {
            addToCart(item, restaurant._id);
        }
    };

    // --- UPDATED FIX FOR DOUBLE POPUP ---
    const handleConfirmClearCart = () => {
        clearCart(); 
        setShowConflictModal(false);
        setTimeout(() => {
            if (pendingItemToAdd) {
                addToCart(pendingItemToAdd, restaurant._id);
                setPendingItemToAdd(null);
            }
        }, 200);
    };

    // --- ITEM CLICK HANDLERS ---
    const handleItemClick = (item) => {
        if (item.variations && item.variations.length > 0) {
            setSelectedItemForVar(item);
            setSelectedVariation(item.variations[0]);
        } else {
            handleAddToCartSafe(item);
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
            handleAddToCartSafe(cartItem, true); 
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

    const coverImageUrl = restaurant.coverImage ? urlFor(restaurant.coverImage).url() : null;
    const showFloatingCart = cartItems.length > 0 && cartRestaurantId === restaurant._id;

    return (
        <div className={styles.pageWrapper} ref={pageWrapperRef} style={{ position: 'relative' }}>
            
            {/* --- HERO HEADER --- */}
            <div 
                className={styles.heroHeader}
                style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : {}}
            >
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

            {/* --- STICKY NAV --- */}
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

            {/* --- MENU GRID --- */}
            <div className={`${styles.menuGrid} menu-grid-mobile-override`}>
                {filteredItems.map(item => (
                    <div 
                        key={item._id} 
                        className={`${styles.foodCard} menu-item-card`} 
                        onClick={() => handleItemClick(item)}
                    >
                        <div className={`${styles.cardImage} menu-item-image`}>
                            {item.image ? (
                                <img src={urlFor(item.image).width(300).height(200).url()} alt={item.name} />
                            ) : (
                                <div className={styles.noImage}><ShoppingBag size={30} /></div>
                            )}
                            <button className={styles.addBtn}><Plus size={18} /></button>
                        </div>
                        
                        <div className={`${styles.cardContent} menu-item-content`}>
                            <div className={styles.cardHeaderRow}>
                                <h3>{item.name}</h3>
                                <span className={`${styles.price} desktop-only-price`}>{getPriceDisplay(item)}</span>
                            </div>
                            
                            <p className={styles.desc}>{item.description}</p>
                            <span className="mobile-only-price">{getPriceDisplay(item)}</span>

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

            {/* --- CART OVERLAY --- */}
            {showFloatingCart && (
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

            {/* --- VARIATION MODAL --- */}
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

            {/* --- CONFLICT RESOLUTION MODAL --- */}
            {showConflictModal && (
                <div className={styles.modalOverlay} style={{zIndex: 1100}}>
                    <div className={styles.varModal} style={{maxWidth: '320px', textAlign:'center', padding:'20px'}}>
                        <div style={{display:'flex', justifyContent:'center', marginBottom:'15px', color:'#ef4444'}}>
                            <AlertTriangle size={40} />
                        </div>
                        <h3 style={{marginBottom:'10px'}}>Start a new basket?</h3>
                        <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>
                            Your cart contains items from another restaurant. Would you like to clear the cart and add this item?
                        </p>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button 
                                onClick={() => { setShowConflictModal(false); setPendingItemToAdd(null); }}
                                style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #ddd', background:'transparent', color:'#fff'}}
                            >
                                No
                            </button>
                            <button 
                                onClick={handleConfirmClearCart}
                                style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#E11D48', color:'white'}}
                            >
                                Yes, Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CHECKOUT MODAL --- */}
            {isCheckoutOpen && (
                <CheckoutModal
                    restaurant={restaurant}
                    onClose={() => setIsCheckoutOpen(false)}
                />
            )}

            {/* --- STYLES INJECTION (MOBILE FIXES) --- */}
            <style>{`
                .mobile-only-price { display: none; }
                .${styles.floatingCartAbsolute} {
                     position: absolute !important;
                     bottom: 20px !important; 
                }

                @media (max-width: 768px) {
                    .menu-grid-mobile-override {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 0px !important;
                        padding: 10px 15px !important;
                    }

                    .menu-item-card {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        padding: 12px 0px !important;
                        gap: 15px !important;
                        height: auto !important;
                        min-height: 100px;
                        border: none !important; 
                        border-radius: 0 !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        border-bottom: 1px solid rgba(255,255,255,0.1) !important; 
                    }

                    .menu-item-image {
                        width: 90px !important; 
                        height: 90px !important;
                        flex-shrink: 0 !important;
                        border-radius: 12px !important;
                        overflow: hidden;
                        background: #222; 
                    }
                    
                    .menu-item-image img {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                    }

                    .menu-item-content {
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                        text-align: left !important;
                        overflow: hidden; 
                    }

                    .menu-item-content h3 {
                        font-size: 1rem !important;
                        font-weight: 600 !important;
                        color: #fff;
                        margin-bottom: 4px !important;
                    }

                    .menu-item-content p {
                        font-size: 0.8rem !important;
                        color: #aaa !important;
                        margin-bottom: 4px !important;
                    }

                    .desktop-only-price { display: none !important; }
                    .mobile-only-price {
                        display: block !important;
                        font-weight: bold !important;
                        color: #FACC15 !important;
                        font-size: 0.95rem !important;
                        margin-top: 2px !important;
                    }

                    .${styles.tags} {
                        margin-top: 6px !important;
                        justify-content: flex-start !important;
                    }
                    
                    .${styles.sizeTag} {
                        font-size: 0.7rem !important;
                        padding: 2px 6px !important;
                        background: #333;
                        color: #fff;
                        border: 1px solid #444;
                    }

                    .${styles.addBtn} {
                        width: 28px !important;
                        height: 28px !important;
                        right: 4px !important;
                        bottom: 4px !important;
                        background: #fff !important;
                        color: #000 !important;
                        border-radius: 50% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MenuPage;