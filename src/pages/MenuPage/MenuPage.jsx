import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { client, urlFor } from '../../sanityClient';
import FoodCart from './FoodCart';
import styles from './MenuPage.module.css';

export default function MenuPage() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [groupedMenu, setGroupedMenu] = useState({});
    const [allCategories, setAllCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);

    // This useEffect will lock the background scroll when the modal is open
    useEffect(() => {
        if (showCheckout) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Cleanup function to re-enable scroll if the component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showCheckout]);

    useEffect(() => {
        const fetchMenu = async () => {
            setIsLoading(true);
            const query = `*[_type == "restaurant" && slug.current == $slug][0]{ ..., "menuItems": *[_type == "menuItem" && references(^._id)]{ ..., "categories": categories[]->{_id, title}}}`;
            const data = await client.fetch(query, { slug });
            if (data) {
                setRestaurant(data);
                const categories = ['All', ...new Set(data.menuItems.flatMap(item => item.categories ? item.categories.map(c => c.title) : []))];
                setAllCategories(categories);
                const groups = data.menuItems.reduce((acc, item) => {
                    const categoryTitles = item.categories?.length ? item.categories.map(c => c.title) : ['General'];
                    categoryTitles.forEach(title => { (acc[title] = acc[title] || []).push(item); });
                    return acc;
                }, {});
                setGroupedMenu(groups);
            }
            setIsLoading(false);
        };
        fetchMenu();
    }, [slug]);

    const itemsToDisplay = useMemo(() => {
        if (activeCategory === 'All') return restaurant?.menuItems || [];
        return groupedMenu[activeCategory] || [];
    }, [activeCategory, groupedMenu, restaurant]);

    if (isLoading) return <div className="page-wrapper container"><h1>Loading menu...</h1></div>;

    return (
        <div className={`${styles.menuPage} page-wrapper container`}>
            <div className={styles.restaurantHeader}>
                {restaurant.logo && <div className={styles.logoWrapper}><img src={urlFor(restaurant.logo).url()} alt={restaurant.name} /></div>}
                <h1>{restaurant.name}</h1>
            </div>
            <div className={styles.menuLayout}>
                <div className={styles.menuContent}>
                    <div className={styles.categoryFilters}>
                        {allCategories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? styles.active : ''}>{cat}</button>
                        ))}
                    </div>
                    {itemsToDisplay.map(item => (
                        <div key={item._id} className={styles.menuItemCard}>
                            <div className={styles.cardBody}>
                                <h3>{item.name}</h3>
                                <p className={styles.itemDescription}>{item.description}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.itemPrice}>Rs. {item.price.toFixed(2)}</span>
                                    <FoodCart item={item} />
                                </div>
                            </div>
                            {item.image && <div className={styles.cardImage}><img src={urlFor(item.image).width(200).url()} alt={item.name} /></div>}
                        </div>
                    ))}
                </div>
                <div className={styles.cartSidebar}>
                    <FoodCart 
                        showSummary={true} 
                        restaurant={restaurant} 
                        showCheckout={showCheckout}
                        setShowCheckout={setShowCheckout}
                    />
                </div>
            </div>
        </div>
    );
}