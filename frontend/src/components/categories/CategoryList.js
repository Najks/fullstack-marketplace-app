import React, { useState } from 'react';
import { useCategories } from './CategoriesContext.jsx';

export default function CategoryList({ selectedCategoryId, onCategorySelect }) {
    const { categories, loading, error } = useCategories();
    const [isOpen, setIsOpen] = useState(false);

    if (loading) {
        return <div className="alert alert-info alert-sm py-2">Loading categories...</div>;
    }

    if (error) {
        return <div className="alert alert-danger alert-sm py-2">{error}</div>;
    }

    if (!categories || categories.length === 0) {
        return <div className="alert alert-secondary alert-sm py-2">No categories available.</div>;
    }

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

    return (
        <div className="dropdown">
            <button
                className="btn btn-outline-primary btn-sm w-100 d-flex justify-content-between align-items-center"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span>
                    <i className="bi bi-folder me-2"></i>
                    {selectedCategory ? selectedCategory.name : 'All Categories'}
                </span>
                <i className={`bi bi-chevron-down ${isOpen ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.2s' }}></i>
            </button>

            {isOpen && (
                <div className="dropdown-menu show w-100 mt-2" style={{ display: 'block', position: 'absolute', zIndex: 1000 }}>
                    <button
                        type="button"
                        className={`dropdown-item ${!selectedCategoryId ? 'active' : ''}`}
                        onClick={() => {
                            onCategorySelect('');
                            setIsOpen(false);
                        }}
                    >
                        <i className="bi bi-funnel me-2"></i>All Categories
                    </button>
                    <div className="dropdown-divider"></div>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className={`dropdown-item d-flex justify-content-between align-items-center ${
                                selectedCategoryId === category.id ? 'active' : ''
                            }`}
                            onClick={() => {
                                onCategorySelect(category.id);
                                setIsOpen(false);
                            }}
                        >
                            <span>{category.name}</span>
                            <span className={`badge ${selectedCategoryId === category.id ? 'bg-light text-dark' : 'bg-secondary'} rounded-pill`}>
                                {category.count ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
