// TestimonialsSection.jsx

import React, { useState, useEffect } from 'react';
import styles from './TestimonialsSection.module.css';
import { client } from '../../sanityClient'; // Ensure path is correct
import { auth, googleProvider } from '../../firebase'; // Firebase import karanna
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { FiUser, FiLogOut, FiEdit3, FiStar } from 'react-icons/fi';

const StarIcon = ({ filled, onClick }) => (
    <svg 
        onClick={onClick}
        width="20" height="20" viewBox="0 0 24 24" 
        fill={filled ? "#FFC107" : "none"} 
        stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
);

const TestimonialCard = ({ name, rating, review, img }) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img src={img || 'https://via.placeholder.com/60'} alt={name} className={styles.profilePic} />
        <div className={styles.headerInfo}>
          <p className={styles.name}>{name}</p>
          <div className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < rating} />
            ))}
          </div>
        </div>
      </div>
      <p className={styles.review}>{review}</p>
    </div>
);

const ReviewFormModal = ({ user, onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(rating, reviewText);
        setIsSubmitting(false);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Write a Review</h3>
                <div className={styles.userInfo}>
                    <img src={user.photoURL} alt="User" />
                    <span>{user.displayName}</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.ratingSelect}>
                        <p>Rate us:</p>
                        <div className={styles.starSelect}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon key={star} filled={star <= rating} onClick={() => setRating(star)} />
                            ))}
                        </div>
                    </div>
                    <textarea 
                        placeholder="Share your experience..." 
                        value={reviewText} 
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        rows={4}
                    />
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 1. Check Auth Status
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // 2. Fetch Reviews from Sanity
    const fetchReviews = async () => {
        try {
            const query = `*[_type == "review"] | order(createdAt desc)`;
            const data = await client.fetch(query);
            setTestimonials(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // 3. Handle Google Login
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    // 4. Submit Review to Sanity
    const handleSubmitReview = async (rating, reviewText) => {
        const reviewDoc = {
            _type: 'review',
            name: user.displayName,
            photo: user.photoURL,
            rating: rating,
            review: reviewText,
            createdAt: new Date().toISOString()
        };

        try {
            await client.create(reviewDoc);
            await fetchReviews(); // Refresh list
            setShowModal(false);
            alert("Thank you! Your review has been posted.");
        } catch (error) {
            console.error("Submission error", error);
            alert("Failed to post review.");
        }
    };

    // Duplicate logic for smooth infinite scroll
    const displayReviews = testimonials.length > 0 ? [...testimonials, ...testimonials] : [];

    return (
      <section className={styles.testimonials}>
        <div className="container" style={{position: 'relative', zIndex: 10}}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          
          {/* --- Review Action Bar --- */}
          <div className={styles.actionBar}>
             {user ? (
                 <div className={styles.loggedInView}>
                     <div className={styles.userBadge}>
                        <img src={user.photoURL} alt="Me" />
                        <span>Hi, {user.displayName.split(' ')[0]}</span>
                     </div>
                     <button onClick={() => setShowModal(true)} className={styles.writeBtn}>
                        <FiEdit3 /> Write a Review
                     </button>
                     <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                        <FiLogOut />
                     </button>
                 </div>
             ) : (
                 <button onClick={handleLogin} className={styles.googleBtn}>
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" width={20} />
                     Sign in to write a review
                 </button>
             )}
          </div>
        </div>

        {testimonials.length === 0 ? (
            <div className={styles.noReviews}>
                <p>No reviews yet. Be the first to review us!</p>
            </div>
        ) : (
            <div className={styles.slider}>
            <div className={styles.slideTrack}>
                {displayReviews.map((t, index) => (
                <TestimonialCard 
                    key={`${t._id}-${index}`} 
                    name={t.name} 
                    rating={t.rating} 
                    review={t.review} 
                    img={t.photo} 
                />
                ))}
            </div>
            </div>
        )}

        {showModal && user && (
            <ReviewFormModal 
                user={user} 
                onClose={() => setShowModal(false)} 
                onSubmit={handleSubmitReview} 
            />
        )}
      </section>
    );
};

export default TestimonialsSection;