import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProductDetailPage.module.css';

// Me data tika ShopPage eken copy kara
const products = [
    { id: 1, category: 'Pharmacy', name: 'Panadol (24 Tablets)', price: 'Rs. 120.00', rating: 5, img: '/images/products/panadol.png', description: 'Provides fast, effective relief from fever and pain such as headaches, migraines, and toothaches.' },
    { id: 2, category: 'Pharmacy', name: 'Vitamin C (100 Capsules)', price: 'Rs. 750.00', rating: 4, img: '/images/products/vitamin-c.png', description: 'A high-potency Vitamin C supplement to support your immune system and overall health.' },
    // Anith product walatath description add karanna
];

const ProductDetailPage = () => {
    const { productId } = useParams();
    const product = products.find(p => p.id === parseInt(productId));

    if (!product) {
        return <div className="container"><h2>Product not found!</h2></div>;
    }

    return (
        <div className={`${styles.productPage} container`}>
            <div className={styles.productLayout}>
                <div className={styles.productImage}>
                    <img src={product.img} alt={product.name} />
                </div>
                <div className={styles.productDetails}>
                    <span className={styles.category}>{product.category}</span>
                    <h1>{product.name}</h1>
                    <div className={styles.rating}>{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</div>
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.price}>{product.price}</div>
                    <div className={styles.actions}>
                        <input type="number" defaultValue="1" min="1" className={styles.quantity} />
                        <button className={styles.addToCartBtn}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;