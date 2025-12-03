import React, { useState, useEffect } from "react";
import Button from "../common/Button.jsx"

export default function Filter({ onFilterChange, statuses = [], categories = [] }) {
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        statusId: "",
        categoryId: "",
        location: "",
    });

    const [priceError, setPriceError] = useState("");
    const [submittedFilters, setSubmittedFilters] = useState(filters);
    const isInitialRender = React.useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        onFilterChange(submittedFilters);
    }, [submittedFilters]); // Remove onFilterChange from deps!

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPriceError("");
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;

        // Always update filters first to allow typing intermediate values
        const newFilters = { ...filters, [name]: value };

        let err = "";

        // Basic numeric checks for the edited field
        if (value !== "") {
            const numValue = Number(value);
            if (!Number.isFinite(numValue)) {
                err = "Price must be a valid number";
            } else if (numValue < 0) {
                err = "Price cannot be negative";
            }
        }

        // Cross-field check only when both are present
        const hasMin = newFilters.minPrice !== "";
        const hasMax = newFilters.maxPrice !== "";
        if (!err && hasMin && hasMax) {
            const min = Number(newFilters.minPrice);
            const max = Number(newFilters.maxPrice);
            if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
                err = "Minimum price cannot exceed maximum price";
            }
        }

        setFilters(newFilters);
        setPriceError(err);
    };

    const handleApplyFilters = () => {
        // Final validation before applying
        if (
            filters.minPrice !== "" &&
            filters.maxPrice !== "" &&
            Number(filters.minPrice) > Number(filters.maxPrice)
        ) {
            setPriceError("Minimum price cannot exceed maximum price");
            return;
        }
        if (priceError) return;
        setSubmittedFilters(filters);
    };

    const handleReset = () => {
        const empty = {
            minPrice: "",
            maxPrice: "",
            statusId: "",
            categoryId: "",
            location: "",
        };
        setFilters(empty);
        setSubmittedFilters(empty);
        setPriceError("");
    };

    const hasActiveFilters =
        filters.minPrice || filters.maxPrice || filters.statusId || filters.categoryId || filters.location;

    return (
        <div className="mb-3">
            <div className="d-flex flex-wrap gap-2 align-items-end">
                {/* Price Range */}
                <div style={{ minWidth: '180px' }}>
                    <label className="form-label small fw-600 mb-1">
                        <i className="bi bi-cash-coin me-1 text-primary"></i>Price
                    </label>
                    <div className="d-flex gap-1">
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            name="minPrice"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={handlePriceChange}
                            min="0"
                            step="0.01"
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            name="maxPrice"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={handlePriceChange}
                            min="0"
                            step="0.01"
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>

                {/* Category */}
                {categories.length > 0 && (
                    <div style={{ minWidth: '160px' }}>
                        <label htmlFor="category" className="form-label small fw-600 mb-1">
                            <i className="bi bi-folder me-1 text-primary"></i>Category
                        </label>
                        <select
                            id="category"
                            className="form-select form-select-sm"
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={handleInputChange}
                        >
                            <option value="">All</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Status */}
                {statuses.length > 0 && (
                    <div style={{ minWidth: '160px' }}>
                        <label htmlFor="status" className="form-label small fw-600 mb-1">
                            <i className="bi bi-tag me-1 text-primary"></i>Status
                        </label>
                        <select
                            id="status"
                            className="form-select form-select-sm"
                            name="statusId"
                            value={filters.statusId}
                            onChange={handleInputChange}
                        >
                            <option value="">All</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Location */}
                <div style={{ minWidth: '150px' }}>
                    <label htmlFor="location" className="form-label small fw-600 mb-1">
                        <i className="bi bi-geo-alt me-1 text-primary"></i>City
                    </label>
                    <input
                        id="location"
                        type="text"
                        className="form-control form-control-sm"
                        name="location"
                        placeholder="Location..."
                        value={filters.location}
                        onChange={handleInputChange}
                        maxLength={100}
                    />
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleApplyFilters}
                        disabled={priceError || !hasActiveFilters}
                        title="Apply filters"
                    >
                        <i className="bi bi-funnel me-1"></i>Apply
                    </Button>

                    {/* Always visible and clickable */}
                    <Button
                        size="sm"
                        onClick={handleReset}
                        title="Clear all filters"
                    >
                        Clear all
                        <i className="bi bi-x-circle ms-1"></i>
                    </Button>
                </div>
            </div>

            {priceError && (
                <div className="alert alert-warning alert-sm py-2 mt-2 mb-0">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {priceError}
                </div>
            )}
        </div>
    );
}