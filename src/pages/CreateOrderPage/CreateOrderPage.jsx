// src/pages/CreateOrderPage/CreateOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CreateOrderPage.module.css';
import { FiBox, FiShoppingCart, FiPlusSquare, FiCamera, FiClock } from 'react-icons/fi';

const ComingSoonPlaceholder = () => (
    <div className={styles.comingSoon}>
        <FiClock />
        <h3>Coming Soon!</h3>
        <p>This service is under development and will be available shortly.</p>
    </div>
);

const CreateOrderPage = () => {
    const [orderType, setOrderType] = useState('parcel');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        
        // Food type එක URL එකෙන් ආවොත් restaurants වෙත යොමු කරයි
        if (type === 'food') {
            navigate('/restaurants');
        } else if (type && ['parcel', 'grocery', 'pharmacy'].includes(type)) {
            setOrderType(type);
        }
    }, [location, navigate]);

    // Sidebar button එකක් ක්ලික් කළ විට ක්‍රියාත්මක වන function එක
    const handleCategoryChange = (type) => {
        if (type === 'food') {
            navigate('/restaurants');
        } else {
            setOrderType(type);
        }
    };

    const categories = [
        { name: 'parcel', label: 'Parcel Delivery', icon: <FiBox /> },
        { name: 'grocery', label: 'Grocery Order', icon: <FiShoppingCart /> },
        { name: 'pharmacy', label: 'Pharmacy Order', icon: <FiPlusSquare /> },
        { name: 'food', label: 'Food Order', icon: <FiCamera /> }
    ];
    
    return (
        <div className="page-wrapper container">
            <header className={styles.pageHeader}>
                <h1>Create a New Request</h1>
                <p>Select a service type and fill out the form to get started.</p>
            </header>
            
            <div className={styles.layoutGrid}>
                <aside className={styles.sidebar}>
                    <div className={styles.categorySelector}>
                        {categories.map(cat => (
                             <button 
                                key={cat.name} 
                                className={`${styles.categoryBtn} ${orderType === cat.name ? styles.active : ''}`} 
                                onClick={() => handleCategoryChange(cat.name)}
                             >
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </aside>
                
                <main className={styles.formCard}>
                    {/* දැනට Parcel, Grocery සහ Pharmacy යන සියල්ලටම Coming Soon පෙන්වයි */}
                    {['parcel', 'grocery', 'pharmacy'].includes(orderType) && <ComingSoonPlaceholder />}
                </main>
            </div>
        </div>
    );
};

export default CreateOrderPage;