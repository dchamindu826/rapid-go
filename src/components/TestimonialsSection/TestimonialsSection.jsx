import React from 'react';
import styles from './TestimonialsSection.module.css';

const testimonialsData = [
  {
    name: 'Anusha Perera',
    rating: 5,
    review: 'Incredibly fast delivery! My package arrived the same day. The tracking system is very accurate. Highly recommended!',
    img: '/images/testimonials/anusha.jpg',
  },
  {
    name: 'Bimal Rathnayake',
    rating: 5,
    review: 'As an e-commerce store owner, RapidGo has been a lifesaver. Their API integration was seamless and saved us hours of manual work.',
    img: '/images/testimonials/bimal.jpg',
  },
  {
    name: 'Fathima Rizwan',
    rating: 4,
    review: 'Good service and reliable. The customer support was very helpful when I had a query about my delivery.',
    img: '/images/testimonials/fathima.jpg',
  },
  {
    name: 'Sanjeewa Silva',
    rating: 5,
    review: 'The best delivery service for pharmacy items. Always on time, and the packages are handled with care. Very professional.',
    img: '/images/testimonials/sanjeewa.jpg',
  },
  {
    name: 'Nayani Jayasinghe',
    rating: 5,
    review: 'I love the live tracking feature. It gives me peace of mind knowing exactly where my order is. Fantastic service!',
    img: '/images/testimonials/nayani.jpg',
  },
];
// ... Anith code eka kalin widiyatama thiyenawa ...
const StarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
  );
  
  const TestimonialCard = ({ name, rating, review, img }) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img src={img} alt={name} className={styles.profilePic} />
        <div className={styles.headerInfo}>
          <p className={styles.name}>{name}</p>
          <div className={styles.stars}>
            {Array.from({ length: rating }).map((_, i) => <StarIcon key={i} />)}
          </div>
        </div>
      </div>
      <p className={styles.review}>{review}</p>
    </div>
  );
  
  const TestimonialsSection = () => {
    const duplicatedTestimonials = [...testimonialsData, ...testimonialsData];
  
    return (
      <section className={styles.testimonials}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
        </div>
        <div className={styles.slider}>
          <div className={styles.slideTrack}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default TestimonialsSection;