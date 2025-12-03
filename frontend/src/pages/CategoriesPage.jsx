import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoriesContext.jsx';

export default function CategoriesPage() {
    const navigate = useNavigate();
    const { categories, loading, error } = useCategories();

    return (
        <div className="container py-5">
            <h1 className="h2 fw-bold mb-2">Browse Categories</h1>
            <p className="text-muted mb-5">Explore all product categories and discover what's available</p>

            {error && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => window.location.reload()}></button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">Loading categories…</p>
                </div>
            ) : categories.length > 0 ? (
                <div className="row g-4">
                    {categories.map(category => (
                        <div key={category.id || category._id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold">{category.name}</h5>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="badge bg-primary">
                                            {category.productCount || 0} products
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/categories/${category.id}/products`)}                                        >
                                            View All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <p className="text-muted">No categories available yet.</p>
                </div>
            )}
        </div>
    );
}