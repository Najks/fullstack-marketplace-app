import React from 'react';

export default function SortMenu({ value, onChange, size = 'sm' }) {
    return (
        <div className="d-flex align-items-center gap-2">
            <label htmlFor="sort-select" className="text-muted small fw-500 mb-0">
                Sort:
            </label>
            <select
                id="sort-select"
                className={`form-select form-select-${size}`}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                aria-label="Sort products"
                style={{ minWidth: '140px' }}
            >
                <option value="">Default</option>
                <option value="created_at:desc">⬇ Newest</option>
                <option value="created_at:asc">⬆ Oldest</option>
                <option value="price:asc">💰 Low to High</option>
                <option value="price:desc">💰 High to Low</option>
                <option value="title:asc">A→Z Title</option>
                <option value="title:desc">Z→A Title</option>
            </select>
        </div>
    );
}
