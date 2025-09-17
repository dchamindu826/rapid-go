import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductDetailPage.module.css';
import { client, urlFor } from '../../sanityClient';

const ProductDetailPage = () => {
    const { productId: productSlug } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            const query = '*[_type == "product" && slug.current == $slug][0]{..., "category": category->{title}}';
            const params = { slug: productSlug };
            const data = await client.fetch(query, params);
            setProduct(data);
            if (data && data.productMedia && data.productMedia.length > 0) {
                setSelectedImage(data.productMedia[0]); // Mulinma mul weni image eka pennanna
            }
            setIsLoading(false);
        };

        fetchProduct();
    }, [productSlug]);

    if (isLoading) {
        return <div className="container" style={{padding: '50px', textAlign:'center'}}><h2>Loading Product...</h2></div>;
    }

    if (!product) {
        return <div className="container" style={{padding: '50px', textAlign:'center'}}><h2>Product not found!</h2></div>;
    }
    
    const getMediaUrl = (mediaItem) => {
        if (!mediaItem) return null;
        if (mediaItem._type === 'image' && mediaItem.asset) {
            return urlFor(mediaItem).url();
        }
        if (mediaItem._type === 'imageUrl' && mediaItem.url) {
            return mediaItem.url;
        }
        return null;
    };

    return (
        <div className={`${styles.productPage} container`}>
            <div className={styles.productLayout}>
                <div className={styles.productImageSection}>
                    <div className={styles.mainImage}>
                        {selectedImage && <img src={getMediaUrl(selectedImage)} alt={product.name} />}
                    </div>
                    <div className={styles.thumbnailGallery}>
                        {product.productMedia?.map((media, index) => {
                            const mediaUrl = getMediaUrl(media);
                            if (mediaUrl) {
                                return (
                                    <div 
                                        key={index} 
                                        className={`${styles.thumbnail} ${selectedImage === media ? styles.active : ''}`}
                                        onClick={() => setSelectedImage(media)}
                                    >
                                        <img src={mediaUrl} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
                <div className={styles.productDetails}>
                    <span className={styles.category}>{product.category?.title}</span>
                    <h1>{product.name}</h1>
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.price}>Rs. {product.price.toFixed(2)}</div>
                    <div className={styles.actions}>
                        <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;