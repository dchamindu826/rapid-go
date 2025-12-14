import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../../sanityClient';
import { FiArrowRight, FiClock, FiLock, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './RestaurantsPage.module.css';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Page ekakata items kiyada?

    // --- Overall Site Delivery Check ---
    const [isDeliveryOpen, setIsDeliveryOpen] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const settingsQuery = `*[_type == "siteSettings" && _id == "general-settings"][0]{isFoodDeliveryOpen}`;
                const settingsData = await client.fetch(settingsQuery);
                const isSiteOpen = settingsData ? settingsData.isFoodDeliveryOpen : true;
                setIsDeliveryOpen(isSiteOpen);

                if (isSiteOpen) {
                    const restoQuery = `*[_type == "restaurant"]{
                        _id, name, "slug": slug.current,
                        "logo": logo.asset->url, description,
                        isOpen
                    }`;
                    const restoData = await client.fetch(restoQuery);
                    setRestaurants(restoData);
                }
            } catch (err) {
                console.error(err);
                setError("Connection error. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- SEARCH & FILTER LOGIC ---
    const filteredRestaurants = restaurants.filter((resto) => 
        resto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Search karanakota aye page 1 ta yanna ona
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // --- PAGINATION LOGIC ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRestaurants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Page eka maru weddi udata scroll wenna ona nam meka danna:
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return <div className="page-wrapper container"><div className={styles.loadingText}>Checking availability...</div></div>;
    }

    if (!isDeliveryOpen) {
        return (
            <div className="page-wrapper container">
                <div style={{
                    textAlign: 'center', padding: '80px 20px',
                    background: 'linear-gradient(145deg, #1e1e1e, #111)',
                    borderRadius: '20px', border: '1px solid #333',
                    marginTop: '40px', maxWidth: '600px',
                    marginLeft: 'auto', marginRight: 'auto'
                }}>
                    <FiClock size={60} color="#FACC15" style={{marginBottom: '20px'}} />
                    <h1 style={{fontSize: '2rem', marginBottom: '15px', color: '#fff'}}>We are currently closed</h1>
                    <p style={{color: '#aaa', fontSize: '1.1rem', marginBottom: '30px'}}>
                        Our food delivery service is currently offline. <br/>
                        We usually start taking orders from <strong>6:00 PM</strong> onwards.
                    </p>
                </div>
            </div>
        );
    }

    if (error) return <div className="page-wrapper container"><div className={styles.errorText}>{error}</div></div>;

    return (
        <div className={`${styles.restaurantsPage} page-wrapper container`}>
            <div className={styles.pageHeader}>
                <h1>Find Your Favorite Food</h1>
                <p>Choose from the best restaurants near you and get it delivered.</p>
                
                <div className={styles.searchContainer}>
                    <FiSearch className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Search for a restaurant..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>
            
            <div className={styles.restaurantsGrid}>
                {currentItems.length > 0 ? (
                    currentItems.map((resto) => {
                        const isClosed = resto.isOpen === false;
                        return (
                            <Link 
                                to={isClosed ? '#' : `/restaurants/${resto.slug}`} 
                                key={resto._id} 
                                className={`${styles.restaurantCard} ${isClosed ? styles.closedCard : ''}`}
                            >
                                <div className={styles.cardImage}>
                                    {isClosed && (
                                        <div className={styles.closedOverlay}>
                                            <FiLock style={{marginBottom: 5}} />
                                            <span>TEMPORARILY CLOSED</span>
                                        </div>
                                    )}
                                    <img 
                                        src={resto.logo || 'https://placehold.co/600x400/1E293B/FFF?text=Restaurant'} 
                                        alt={`${resto.name}`} 
                                    />
                                </div>
                                <div className={styles.cardContent}>
                                    <div>
                                        <h3>{resto.name}</h3>
                                        <p>{resto.description ? resto.description : "Delicious food delivered to your doorstep."}</p>
                                    </div>
                                    <div className={styles.viewMenuText}>
                                        {isClosed ? (
                                            <span style={{color: '#ff4d4d'}}>Currently Unavailable</span>
                                        ) : (
                                            <>View Menu <FiArrowRight /></>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className={styles.noResults}>
                        <p>No restaurants found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                    >
                        <FiChevronLeft />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePageBtn : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className={styles.pageBtn}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RestaurantsPage;