import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { productApi } from '../api/productApi.js';
import ProductCard from '../components/products/ProductCard.jsx';

export default function MyFavoritesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

    // Prevent duplicate fetches in React Strict Mode (dev) and re‑fetch per user
    const fetchedForUser = useRef(null);

    useEffect(() => {
        if (!user?.id) return;
        if (fetchedForUser.current === user.id) return;
        fetchedForUser.current = user.id;

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const favs = await productApi.getFavorites(user.id);
                // Map to product objects if API returns wrappers like { product, ... }
                const list = Array.isArray(favs) ? favs.map(f => f.product ?? f).filter(Boolean) : [];
                if (!cancelled) {
                    setProducts(list);
                    const total = list.length;
                    const pages = Math.max(1, Math.ceil(total / pagination.limit));
                    setPagination(prev => ({
                        ...prev,
                        total,
                        pages,
                        page: Math.min(prev.page, pages),
                    }));
                }
            } catch (_) {
                if (!cancelled) setError('Failed to load favorites');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [user?.id, pagination.limit]);

    const pageProducts = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return products.slice(start, start + pagination.limit);
    }, [products, pagination.page, pagination.limit]);

    if (loading && products.length === 0) {
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">My Favorites</h1>
            </div>

            {error && (
                <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-circle me-2"></i>{error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>No favorite products yet.
                </div>
            ) : (
                <>
                    <h5 className="mb-3">
                        <i className="bi bi-heart-fill text-danger me-2"></i>
                        Favorites ({pagination.total})
                    </h5>

                    <div className="row g-4">
                        {pageProducts.map((product) => (
                            <div key={product.id ?? product._id} className="col-md-6 col-lg-4">
                                <ProductCard
                                    product={product}
                                    initialFavorite={true} // suppress FavoriteButton GETs
                                    onView={() => navigate(`/products/${product.id ?? product._id}`)}
                                />
                            </div>
                        ))}
                    </div>

                    {pagination.pages > 1 && (
                        <nav className="mt-4" aria-label="Favorite products page navigation">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}