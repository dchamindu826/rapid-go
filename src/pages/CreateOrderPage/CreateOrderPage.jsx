// CreateOrderPage.jsx (UPDATED)

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CreateOrderPage.module.css';
import { client } from '../../sanityClient';
import { FiBox, FiShoppingCart, FiPlusSquare, FiCamera, FiClock } from 'react-icons/fi'; // FiClock imported

const SubmissionStatus = ({ status, message }) => (
    <div className={`${styles.submissionStatus} ${styles[status]}`}>{message}</div>
);

// --- PARCEL FORM EKA (Wenasak Na) ---
const ParcelForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        pickupContactName: '', pickupContactPhone: '', pickupAddress: '',
        deliveryAddress: '', destinationMapLink: '',
        customerName: '', customerPhone: ''
    });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    return (
        <form className={styles.orderForm} onSubmit={(e) => onSubmit(e, formData, 'parcel')}>
            <h3>Pickup Details</h3>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Pickup Contact Name <span className={styles.required}>*</span></label><input type="text" name="pickupContactName" onChange={handleChange} value={formData.pickupContactName} required /></div>
                <div className={styles.formGroup}><label>Pickup Contact Phone <span className={styles.required}>*</span></label><input type="tel" name="pickupContactPhone" onChange={handleChange} value={formData.pickupContactPhone} required /></div>
            </div>
            <div className={styles.formGroup}><label>Pickup Address <span className={styles.required}>*</span></label><textarea name="pickupAddress" rows="3" onChange={handleChange} value={formData.pickupAddress} required></textarea></div>
            
            <h3 style={{marginTop: '40px'}}>Destination Details</h3>
            <div className={styles.formGroup}><label>Delivery Address <span className={styles.required}>*</span></label><textarea name="deliveryAddress" rows="3" onChange={handleChange} value={formData.deliveryAddress} required></textarea></div>
            <div className={styles.formGroup}><label>Destination Google Map Link (Optional)</label><input type="url" name="destinationMapLink" onChange={handleChange} value={formData.destinationMapLink} placeholder="Paste Google Maps URL here" /></div>

            <hr className={styles.divider} />
            <h3 style={{marginTop: '40px'}}>Receiver Details</h3>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}><label>Receiver's Name <span className={styles.required}>*</span></label><input type="text" name="customerName" onChange={handleChange} value={formData.customerName} required /></div>
                <div className={styles.formGroup}><label>Receiver's Phone <span className={styles.required}>*</span></label><input type="tel" name="customerPhone" onChange={handleChange} value={formData.customerPhone} required /></div>
            </div>
            <button type="submit" className={styles.submitBtn}>Request Pickup</button>
        </form>
    );
};

// ===========================================
// === ALUTH COMING SOON COMPONENT EKA ===
// ===========================================
const ComingSoonPlaceholder = () => {
    return (
        <div className={styles.comingSoon}>
            <FiClock />
            <h3>Coming Soon!</h3>
            <p>This service is under development and will be available shortly.</p>
        </div>
    );
};


// --- PRADHANA PAGE COMPONENT EKA ---
const CreateOrderPage = () => {
    const [orderType, setOrderType] = useState('parcel');
    const [submission, setSubmission] = useState({ status: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type && ['parcel', 'grocery', 'pharmacy', 'food'].includes(type)) {
            setOrderType(type);
        }
    }, [location]);

    // HandleSubmit function eka dan parcel walata witharak wada karanna haduwe
    const handleSubmit = async (e, formData, type) => {
        e.preventDefault();
        setSubmission({ status: null, message: '' });
        setIsSubmitting(true);

        try {
            // This logic now only applies to parcels
            const doc = {
                _type: 'deliveryOrder',
                orderType: type,
                orderId: `#RG${Date.now().toString().slice(-6)}`,
                status: 'pending',
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                pickupContactName: formData.pickupContactName,
                pickupContactPhone: formData.pickupContactPhone,
                pickupAddress: formData.pickupAddress,
                deliveryAddress: formData.deliveryAddress,
                destinationMapLink: formData.destinationMapLink,
            };
            
            await client.create(doc);
            setSubmission({ status: 'success', message: 'Your parcel request has been placed successfully!' });
            e.target.reset(); // Reset the form fields

        } catch (error) {
            console.error("Order submission failed:", error);
            setSubmission({ status: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
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
                             <button key={cat.name} className={`${styles.categoryBtn} ${orderType === cat.name ? styles.active : ''}`} onClick={() => setOrderType(cat.name)}>
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </aside>
                
                <main className={styles.formCard}>
                    {isSubmitting && <div className={styles.loader}>Submitting...</div>}
                    {!isSubmitting && submission.status && <SubmissionStatus status={submission.status} message={submission.message} />}

                    {/* === MEKA THAMA PRADHANA WENAS KAMA === */}
                    {orderType === 'parcel' && <ParcelForm onSubmit={handleSubmit} />}
                    {['grocery', 'pharmacy', 'food'].includes(orderType) && <ComingSoonPlaceholder />}
                </main>
            </div>
        </div>
    );
};

export default CreateOrderPage;