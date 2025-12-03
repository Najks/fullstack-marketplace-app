import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from "../components/products/ProductCard.jsx";

export default function MyProductsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeProducts, setActiveProducts] = useState([]);
    const [soldProducts, setSoldProducts] = useState([]);
    const [activePagination, setActivePagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [soldPagination, setSoldPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyProducts = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const [activeRes, soldRes, favorites] = await Promise.all([
                    productApi.byUser(user.id, activePagination.page),
                    productApi.bySold(user.id, soldPagination.page),
                    productApi.getFavorites(user.id),
                ]);

                setActiveProducts(activeRes?.products || []);
                setActivePagination(activeRes?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });

                setSoldProducts(soldRes?.products || []);
                setSoldPagination(soldRes?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });

                const ids = new Set((Array.isArray(favorites) ? favorites : []).map(f => f.productId));
                setFavoriteIds(ids);
            } catch (e) {
                console.error('[MyProductsPage] Failed to fetch products:', e);
                setError(e?.response?.data?.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, [user?.id, activePagination.page, soldPagination.page]);

    if (loading) {
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const renderProductSection = (products, pagination, setPagination, title, icon) => (
        <>
            {products.length > 0 && (
                <div className="mb-5">
                    <h5 className="mb-3">
                        <i className={`bi ${icon} me-2`}></i>
                        {title} ({products.length})
                    </h5>
                    <div className="row g-4">
                        {products.map((product) => (
                            <div key={product.id} className="col-md-6 col-lg-4">
                                <ProductCard
                                    product={product}
                                    initialFavorite={favoriteIds.has(product.id)}
                                    onView={() => navigate(`/products/${product.id}`)}
                                    onEdit={() => navigate(`/products/${product.id}/edit`)}
                                    onDelete={() => handleDelete(product.id)}
                                    onMarkAsSold={() => handleMarkAsSold(product.id)}
                                    onMarkAsUnsold={() => handleMarkAsUnsold(product.id)}
                                />
                            </div>
                        ))}
                    </div>
                    {pagination.pages > 1 && (
                        <nav className="mt-4" aria-label="Page navigation">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPagination({ ...pagination, page })}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">My Products</h1>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate('/create-product')}
                >
                    <i className="bi bi-plus-circle me-1"></i>Add Product
                </button>
            </div>

            {error && (
                <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            {activeProducts.length === 0 && soldProducts.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    You haven't created any products yet.
                </div>
            ) : (
                <>
                    {renderProductSection(activeProducts, activePagination, setActivePagination, 'Active Products', 'bi-check-circle text-success')}
                    {renderProductSection(soldProducts, soldPagination, setSoldPagination, 'Sold Products', 'bi-check2-all text-secondary')}
                </>
            )}
        </div>
    );

    async function handleMarkAsSold(productId) {
        try {
            await productApi.update(productId, { statusId: 2 });
            setActiveProducts(prev => {
                const moved = prev.find(p => p.id === productId);
                if (moved) setSoldProducts(sPrev => [{ ...moved, statusId: 2 }, ...sPrev]);
                return prev.filter(p => p.id !== productId);
            });
        } catch {
            setError('Failed to mark product as sold');
        }
    }

    async function handleMarkAsUnsold(productId) {
        try {
            await productApi.update(productId, { statusId: 1 });
            setSoldProducts(prev => {
                const moved = prev.find(p => p.id === productId);
                if (moved) setActiveProducts(aPrev => [{ ...moved, statusId: 1 }, ...aPrev]);
                return prev.filter(p => p.id !== productId);
            });
        } catch {
            setError('Failed to mark product as not sold');
        }
    }

    async function handleDelete(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await productApi.delete(productId);
                setActiveProducts(prev => prev.filter(p => p.id !== productId));
                setSoldProducts(prev => prev.filter(p => p.id !== productId));
            } catch {
                setError('Failed to delete product');
            }
        }
    }
}
