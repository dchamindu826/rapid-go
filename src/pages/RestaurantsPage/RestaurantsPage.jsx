// src/pages/RestaurantsPage/RestaurantsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// --- මෙන්න වෙනස: 'readClient' වෙනුවට 'writeClient' import කලා ---
import { writeClient } from '../../sanityClient'; 
import styles from './RestaurantsPage.module.css';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            setIsLoading(true);
            try {
                const query = `*[_type == "restaurant"]{
                    _id,
                    name,
                    "slug": slug.current,
                    "logo": logo.asset->url,
                    description
                }`;
                // --- මෙතනත් 'readClient' වෙනුවට 'writeClient' පාවිච්චි කලා ---
                const data = await writeClient.fetch(query);
                setRestaurants(data);
            } catch (err) {
                console.error("Failed to fetch restaurants:", err);
                setError("Couldn't load restaurants. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (isLoading) {
        return <div className="page-wrapper container"><h1 className={styles.loadingText}>Loading Restaurants...</h1></div>;
    }

    if (error) {
        return <div className="page-wrapper container"><h1 className={styles.errorText}>{error}</h1></div>;
    }

    return (
        <div className={`${styles.restaurantsPage} page-wrapper container`}>
            <div className={styles.pageHeader}>
                <h1>Find Your Favorite Food</h1>
                <p>Select a restaurant to view the menu and place an order.</p>
            </div>
            <div className={styles.restaurantsGrid}>
                {restaurants.map((resto) => (
                    <Link to={`/restaurants/${resto.slug}`} key={resto._id} className={styles.restaurantCard}>
                        <div className={styles.cardImage}>
                            <img src={resto.logo} alt={`${resto.name} Logo`} />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{resto.name}</h3>
                            <p>{resto.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RestaurantsPage;