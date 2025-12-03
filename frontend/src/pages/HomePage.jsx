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
            <section className="hero-section mb-5">
                <div className="container py-5">
                    <div className="row align-items-center" style={{ minHeight: '400px' }}>
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4" style={{
                                color: 'var(--bs-dark)',
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2'
                            }}>
                                Local Marketplace
                            </h1>
                            <p className="lead text-muted mb-4" style={{
                                fontSize: '1.15rem',
                                lineHeight: '1.7'
                            }}>
                                List items for sale or browse products from sellers in your area.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Button
                                    type="button"
                                    className="btn btn-primary fw-semibold px-4 py-2"
                                    style={{
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    onClick={() => navigate('/products')}
                                >
                                    Browse Products
                                </Button>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary fw-semibold px-4 py-2"
                                    style={{
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    onClick={() => navigate('/create-product')}
                                >
                                    List a Product
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderRadius: '16px',
                                    padding: '3rem',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                                }}>
                                    <div className="text-center">
                                        <h3 className="h5 fw-semibold text-muted mb-2">Start selling today</h3>
                                        <p className="text-muted small mb-0">No fees • Direct contact • Local deals</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Products Section */}
            <section className="container mb-5">
                <div className="mb-5">
                    <h2 className="h2 fw-bold mb-2">Recently Added</h2>
                    <p className="text-muted">Check out the latest products from our community</p>
                </div>

                {error && (
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3">Loading products…</p>
                    </div>
                ) : recentProducts.length > 0 ? (
                    <ProductGrid products={recentProducts} />
                ) : (
                    <div className="text-center py-5">
                        <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.3 }}>📦</div>
                        <p className="text-muted mb-4 fs-5">No products available yet.</p>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg px-5"
                            onClick={() => navigate('/create-product')}
                        >
                            Be the first to add a product
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}