import React from 'react';

export default function SearchBar({ value, onChange, onApply, placeholder = 'Search products...', size = 'sm' }) {
    return (
        <form
            className="d-flex gap-2 align-items-center"
            onSubmit={(e) => {
                e.preventDefault();
                onApply?.();
            }}
        >
            <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                <input
                    type="search"
                    className={`form-control form-control-${size} ps-3`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    style={{ borderRadius: '0.375rem' }}
                />
            </div>
            <button type="submit" className={`btn btn-${size} btn-primary flex-shrink-0`}>
                <i className="bi bi-search me-1"></i>Search
            </button>
        </form>
    );
}
