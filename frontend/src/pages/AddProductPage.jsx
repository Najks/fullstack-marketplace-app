import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi} from "../api/productApi.js";
import AddProductForm from "../components/products/AddProductForm.jsx";

export default function AddProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');

        try {
            const res = await productApi.create(formData);
            navigate(`/products/${res.id}`);
        } catch (e) {
            console.error('[AddProductPage] Failed to create product:', e);
            setError(e?.response?.data?.message || e?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <h1 className="h3 mb-0">Add New Product</h1>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-4">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            {error}
                        </div>
                    )}

                    <AddProductForm onSubmit={handleSubmit} loading={loading} />
                </div>
            </div>
        </div>
    );
}
