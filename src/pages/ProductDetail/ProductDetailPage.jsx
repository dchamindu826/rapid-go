import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductDetailPage.module.css';
import { client, urlFor } from '../../sanityClient';

const ProductDetailPage = () => {
    const { productId: productSlug } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            const query = `*[_type == "product" && slug.current == $slug][0]{
                ..., 
                "category": category->{name},
                "videoUrl": video.asset->url,
                "images": images[]{
                    _key,
                    asset
                }
            }`;
            const params = { slug: productSlug };
            try {
                const data = await client.fetch(query, params);
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productSlug]);

    const mediaGallery = useMemo(() => {
        if (!product) return [];
        const items = [];
        if (product.images) {
            product.images.forEach(img => items.push({ type: 'image', ...img }));
        }
        if (product.envatoMediaLink) {
             items.push({ type: 'video', url: product.envatoMediaLink, _key: 'video-preview' });
        }
        return items;
    }, [product]);

    useEffect(() => {
        if (mediaGallery.length > 0 && !selectedMedia) {
            setSelectedMedia(mediaGallery[0]);
        }
    }, [mediaGallery, selectedMedia]);
    
    if (isLoading) { return <div className={styles.loader}>Loading Product...</div>; }
    if (!product) { return <div className={styles.loader}>Product not found!</div>; }

    const renderMainMedia = () => {
        if (!selectedMedia) return null;

        if (selectedMedia.type === 'video') {
            const isYouTube = selectedMedia.url.includes('youtube.com') || selectedMedia.url.includes('youtu.be');
            const videoId = isYouTube ? selectedMedia.url.split('v=')[1]?.split('&')[0] || selectedMedia.url.split('/').pop() : null;
            
            if (videoId) {
                return <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
            }
            return <video src={selectedMedia.url} controls autoPlay muted loop />;
        }

        return <img src={urlFor(selectedMedia.asset).url()} alt={product.name} />;
    };

    return (
        <div className={`${styles.productPage} container`}>
            <div className="page-wrapper container"></div>
            <div className={styles.productLayout}>
                <div className={styles.productMediaSection}>
                    <div className={styles.mainImage}>
                        {renderMainMedia()}
                    </div>
                    <div className={styles.thumbnailGallery}>
                        {mediaGallery.map((media) => (
                            <div 
                                key={media._key} 
                                className={`${styles.thumbnail} ${selectedMedia?._key === media._key ? styles.active : ''}`}
                                onClick={() => setSelectedMedia(media)}
                            >
                                <img 
                                    src={media.type === 'image' ? urlFor(media.asset).width(100).height(100).url() : 'https://placehold.co/100x100/1E293B/E2E8F0?text=Video'} 
                                    alt="Thumbnail"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.productDetails}>
                    <span className={styles.category}>{product.category?.name}</span>
                    <h1>{product.name}</h1>
                    <p className={styles.description}>{product.shortDescription}</p>
                    <div className={styles.price}>Rs. {product.price?.toFixed(2)}</div>
                    <div className={styles.actions}>
                        <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;