import React, { useState, useEffect } from 'react';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { productApi } from '../../api/productApi.js';
import Button from '../common/Button.jsx';
import {useAuth} from "../../context/AuthContext.jsx";

export default function AddProductForm({ onSubmit, loading = false }) {
    const { categories } = useCategories();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryIds: [],
        location_city: '',
        location_country: '',
        images: [],
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState([]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Product title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (formData.categoryIds.length === 0) newErrors.categoryIds = 'At least one category is required';
        if (!formData.location_city.trim()) newErrors.location_city = 'City is required';
        if (!formData.location_country.trim()) newErrors.location_country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            categoryIds: checked
                ? [...prev.categoryIds, value]
                : prev.categoryIds.filter((id) => id !== value),
        }));
        if (errors.categoryIds) setErrors((prev) => ({ ...prev, categoryIds: '' }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreview(previews);
        setFormData((prev) => ({ ...prev, images: files }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', Number(formData.price));
        data.append('categoryIds', formData.categoryIds.join(','));
        data.append('location_city', formData.location_city);
        data.append('location_country', formData.location_country);
        data.append('statusId', '1');
        data.append("userId", user.id)
        formData.images.forEach((image) => {
            data.append('images', image);
        });

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4">
            {/* Product Title */}
            <div className="mb-3">
                <label htmlFor="title" className="form-label fw-600">
                    <i className="bi bi-tag me-1 text-primary"></i>Product Title
                </label>
                <input
                    id="title"
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    name="title"
                    placeholder="Enter product title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={200}
                />
                {errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
                <label htmlFor="description" className="form-label fw-600">
                    <i className="bi bi-file-text me-1 text-primary"></i>Description
                </label>
                <textarea
                    id="description"
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={1000}
                />
                {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
            </div>

            {/* Price */}
            <div className="mb-3">
                <label htmlFor="price" className="form-label fw-600">
                    <i className="bi bi-cash-coin me-1 text-primary"></i>Price
                </label>
                <div className="input-group">
                    <span className="input-group-text">€</span>
                    <input
                        id="price"
                        type="number"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        name="price"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                    />
                </div>
                {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
            </div>

            {/* Categories */}
            <div className="mb-3">
                <label className="form-label fw-600">
                    <i className="bi bi-folder me-1 text-primary"></i>Categories
                </label>
                <div className={`border rounded p-3 ${errors.categoryIds ? 'border-danger' : ''}`}>
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <div key={cat.id} className="form-check mb-2">
                                <input
                                    id={`cat-${cat.id}`}
                                    type="checkbox"
                                    className="form-check-input"
                                    value={cat.id}
                                    checked={formData.categoryIds.includes(String(cat.id))}
                                    onChange={handleCategoryChange}
                                />
                                <label htmlFor={`cat-${cat.id}`} className="form-check-label">
                                    {cat.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted mb-0">No categories available</p>
                    )}
                </div>
                {errors.categoryIds && <div className="invalid-feedback d-block">{errors.categoryIds}</div>}
            </div>

            {/* Location City */}
            <div className="mb-3">
                <label htmlFor="location_city" className="form-label fw-600">
                    <i className="bi bi-geo-alt me-1 text-primary"></i>City
                </label>
                <input
                    id="location_city"
                    type="text"
                    className={`form-control ${errors.location_city ? 'is-invalid' : ''}`}
                    name="location_city"
                    placeholder="Enter city"
                    value={formData.location_city}
                    onChange={handleInputChange}
                    maxLength={100}
                />
                {errors.location_city && <div className="invalid-feedback d-block">{errors.location_city}</div>}
            </div>

            {/* Location Country */}
            <div className="mb-3">
                <label htmlFor="location_country" className="form-label fw-600">
                    <i className="bi bi-globe me-1 text-primary"></i>Country
                </label>
                <input
                    id="location_country"
                    type="text"
                    className={`form-control ${errors.location_country ? 'is-invalid' : ''}`}
                    name="location_country"
                    placeholder="Enter country"
                    value={formData.location_country}
                    onChange={handleInputChange}
                    maxLength={100}
                />
                {errors.location_country && <div className="invalid-feedback d-block">{errors.location_country}</div>}
            </div>

            {/* Images */}
            <div className="mb-3">
                <label htmlFor="images" className="form-label fw-600">
                    <i className="bi bi-image me-1 text-primary"></i>Product Images
                </label>
                <input
                    id="images"
                    type="file"
                    className="form-control"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                />
                <small className="text-muted">Upload up to 5 images (JPG, PNG)</small>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
                <div className="mb-3">
                    <label className="form-label fw-600">Preview</label>
                    <div className="row g-2">
                        {imagePreview.map((preview, idx) => (
                            <div key={idx} className="col-md-3">
                                <img src={preview} alt={`Preview ${idx}`} className="img-fluid rounded" style={{ maxHeight: '150px', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit Buttons */}
            <div className="d-flex gap-2 justify-content-end">
                <Button type="button" size="md" variant="secondary" >
                    Cancel
                </Button>
                <Button type="submit" size="md">
                    <i className="bi bi-plus-circle me-1"></i>
                    {loading ? 'Creating...' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
}