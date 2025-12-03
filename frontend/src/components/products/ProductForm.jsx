import React, { useState, useEffect } from 'react';
import { useCategories } from '../../context/CategoriesContext.jsx';
import Button from "../common/Button.jsx";

export default function ProductForm({ product, onSubmit }) {
    const { categories } = useCategories();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryIds: [],
        country: '',
        city: '',
        newImages: [],
    });
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(!categories.length);

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                price: product.price || '',
                categoryIds: product.categories?.map(c => c.category?.id) || [],
                country: product.location?.country || '',
                city: product.location?.city || '',
                newImages: [],
            });
            setExistingImages(product.images || []);
        }
        if (categories.length) {
            setLoading(false);
        }
    }, [product, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            categoryIds: checked
                ? [...prev.categoryIds, parseInt(value)]
                : prev.categoryIds.filter(id => id !== parseInt(value)),
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setFormData(prev => ({
            ...prev,
            newImages: [...prev.newImages, ...files],
        }));
    };

    const removeNewImage = (index) => {
        setFormData(prev => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== index),
        }));
    };

    const removeExistingImage = (imageId) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', parseFloat(formData.price));
        formDataToSend.append('country', formData.country);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds));

        if (existingImages.length > 0) {
            formDataToSend.append('existingImages', JSON.stringify(existingImages.map(img => img.id)));
        }

        formData.newImages.forEach((file) => {
            formDataToSend.append('images', file);
        });

        onSubmit(formDataToSend);
    };

    if (loading) {
        return (
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card p-4">
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>

            <div className="mb-3">
                <label htmlFor="price" className="form-label">Price</label>
                <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Categories</label>
                <div className="border p-3 rounded">
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <div key={cat.id} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`category-${cat.id}`}
                                    value={cat.id}
                                    checked={formData.categoryIds.includes(cat.id)}
                                    onChange={handleCategoryChange}
                                />
                                <label className="form-check-label" htmlFor={`category-${cat.id}`}>
                                    {cat.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted mb-0">No categories available</p>
                    )}
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="images" className="form-label">Images</label>
                <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>

            {formData.newImages.length > 0 && (
                <div className="mb-3">
                    <label className="form-label">New Images</label>
                    <div className="row g-2">
                        {formData.newImages.map((file, index) => (
                            <div key={index} className="col-md-3">
                                <div className="card position-relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        className="card-img-top"
                                        alt={`preview-${index}`}
                                        style={{ height: '100px', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                        onClick={() => removeNewImage(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {existingImages.length > 0 && (
                <div className="mb-3">
                    <label className="form-label">Existing Images</label>
                    <div className="row g-2">
                        {existingImages.map(img => (
                            <div key={img.id} className="col-md-3">
                                <div className="card position-relative">
                                    <img
                                        src={`http://localhost:5000${img.url}`}
                                        className="card-img-top"
                                        alt="product"
                                        style={{ height: '100px', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                        onClick={() => removeExistingImage(img.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="d-flex gap-2">
                <Button type="submit" className="btn btn-primary">
                    {product ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}