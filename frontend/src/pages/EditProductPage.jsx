import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductForm from '../components/products/ProductForm.jsx';

export default function EditProductPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productApi.getById(productId);
                const fetchedProduct = res.product;
                // Check if user owns the product
                if (fetchedProduct.userId !== user?.id) {
                    setError('You do not have permission to edit this product');
                    return;
                }

                setProduct(fetchedProduct);
            } catch (e) {
                console.error('[EditProductPage] Failed to fetch product:', e);
                setError(e?.response?.data?.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (productId && user?.id) fetchProduct();
    }, [productId, user?.id]);

    const handleSubmit = async (formData) => {
        try {
            await productApi.update(productId, formData);
            navigate('/my-products');
        } catch (e) {
            console.error('[EditProductPage] Failed to update product:', e);
            setError(e?.response?.data?.message || 'Failed to update product');
        }
    };

    if (loading) {
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h1 className="h3 mb-4">Edit Product</h1>
            {product && <ProductForm product={product} onSubmit={handleSubmit} />}
        </div>
    );
}
