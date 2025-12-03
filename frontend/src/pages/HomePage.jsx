import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import Button from "../components/common/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductGrid from '../components/products/ProductGrid.jsx';

export default function HomePage() {
    const navigate = useNavigate();
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRecentProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productApi.searchFilter({
                    limit: 8,
                    sort: 'created_at:desc',
                    userId: user?.id
                });
                const data = response?.data ?? response;
                setRecentProducts(data?.products ?? data?.items ?? []);
            } catch (err) {
                setError('Failed to load products');
                setRecentProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentProducts();
    }, [user]);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section
                className="py-5 mb-5 text-center bg-primary"
                style={{
                    background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-info) 100%)',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}
            >
                <div className="container">
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ fontSize: '100px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
                            🛍️
                        </div>
                        <h1 className="display-4 fw-bold mb-3">
                            Buy and Sell Locally
                        </h1>
                        <p className="lead mb-4" style={{ fontSize: '1.1rem', opacity: 0.95 }}>
                            Publish your product for free and connect directly with buyers.
                        </p>
                        <div className="d-flex gap-3 flex-wrap justify-content-center">
                            <Button
                                type="button"
                                className="btn btn-light fw-bold px-5 py-2"
                                onClick={() => navigate('/products')}
                            >
                                View Products
                            </Button>
                            <button
                                type="button"
                                className="btn btn-outline-light fw-bold px-5 py-2"
                                onClick={() => navigate('/create-product')}
                            >
                                Add Your Product
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Products Section */}
            <section className="container mb-5">
                <div className="mb-4">
                    <h2 className="h3 fw-bold">Recently Added Products</h2>
                    <p className="text-muted">Discover the latest items from our community</p>
                </div>

                {error && (
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2">Loading products…</p>
                    </div>
                ) : recentProducts.length > 0 ? (
                    <ProductGrid products={recentProducts} />
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted mb-3">No products available yet.</p>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/create-product')}
                        >
                            Be the first to add a product!
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}