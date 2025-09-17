import React from 'react';
import { urlFor } from '../../sanityClient';
import styles from './ProductImage.module.css';

const ProductImage = ({ mediaItem, altText = 'Product Image', width = 100 }) => {
    
    const getImageUrl = () => {
        if (!mediaItem) return ''; // No media item provided
        
        // If it's a Sanity Uploaded Image
        if (mediaItem._type === 'image' && mediaItem.asset) {
            return urlFor(mediaItem).width(width).quality(80).url();
        }
        
        // If it's an external Image URL
        if (mediaItem._type === 'imageUrl' && mediaItem.url) {
            return mediaItem.url;
        }

        // Return empty if no valid source found
        return '';
    };

    const imageUrl = getImageUrl();

    if (!imageUrl) {
        return <div className={styles.placeholder}>No Image</div>;
    }

    return <img src={imageUrl} alt={altText} className={styles.image} />;
};

export default ProductImage;