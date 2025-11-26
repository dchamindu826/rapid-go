// src/pages/RestaurantsPage/RestaurantsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../../sanityClient';
import { FiArrowRight, FiClock, FiLock } from 'react-icons/fi'; // Icons
import styles from './RestaurantsPage.module.css';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- Overall Site Delivery Check ---
    const [isDeliveryOpen, setIsDeliveryOpen] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Settings Check (General On/Off)
                const settingsQuery = `*[_type == "siteSettings" && _id == "general-settings"][0]{isFoodDeliveryOpen}`;
                const settingsData = await client.fetch(settingsQuery);
                
                const isSiteOpen = settingsData ? settingsData.isFoodDeliveryOpen : true;
                setIsDeliveryOpen(isSiteOpen);

                // 2. Fetch Restaurants with 'isOpen' field
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

    if (isLoading) {
        return <div className="page-wrapper container"><div className={styles.loadingText}>Checking availability...</div></div>;
    }

    // --- CLOSED MESSAGE (Whole Site) ---
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
                    <div style={{
                        display: 'inline-block', padding: '10px 20px',
                        backgroundColor: 'rgba(250, 204, 21, 0.1)', color: '#FACC15',
                        borderRadius: '50px', border: '1px solid #FACC15', fontWeight: '600'
                    }}>
                        Please check back later!
                    </div>
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
            </div>
            
            <div className={styles.restaurantsGrid}>
                {restaurants.map((resto) => {
                    // Check if individual restaurant is closed
                    const isClosed = resto.isOpen === false;

                    return (
                        <Link 
                            to={isClosed ? '#' : `/restaurants/${resto.slug}`} 
                            key={resto._id} 
                            className={`${styles.restaurantCard} ${isClosed ? styles.closedCard : ''}`}
                        >
                            <div className={styles.cardImage}>
                                {/* Show CLOSED overlay if restaurant is closed */}
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
                })}
            </div>
        </div>
    );
};

export default RestaurantsPage;