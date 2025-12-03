import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ProfileInfo from '../components/profile/ProfileInfo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { productApi } from '../api/productApi.js';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, loading: authLoading, logout, loggedIn } = useAuth();
    const [productCount, setProductCount] = useState(0);
    const [countLoading, setCountLoading] = useState(false);
    const [recentProducts, setRecentProducts] = useState([]);

    // Recent products (demo)
    useEffect(() => {
        productApi.searchFilter({ limit: 6, sort: 'createdAt:asc' })
            .then(data => setRecentProducts(data?.products || []))
            .catch(() => setRecentProducts([]));
    }, []);

    // Actual count by user
    useEffect(() => {
        if (!user?.id) return;
        setCountLoading(true);
        productApi.countByUser(user.id)
            .then(data => {
                const count = typeof data === 'number' ? data : (data?.count ?? 0);
                setProductCount(count);
            })
            .catch(() => setProductCount(0))
            .finally(() => setCountLoading(false));
    }, [user?.id]);

    if (authLoading) {
        return (
            <div className="container py-5">
                <div className="text-muted text-center">Loading profile…</div>
            </div>
        );
    }

    if (!user || loggedIn === false) {
        return <Navigate to="/auth" replace />;
    }

    const handleEdit = () => {
        navigate('/profile/edit');
    };

    return (
        <div className="container py-5">
            <div className="row mb-4">
                <div className="col">
                    <h1 className="h3 fw-bold">Your profile</h1>
                </div>
            </div>

            <div className="row mb-5">
                <div className="col">
                    <ProfileInfo user={user} onEdit={handleEdit} />
                </div>
            </div>

            <div className="row mb-5">
                <div className="col-md-6">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h3 className="h4 fw-bold mb-1">{countLoading ? '...' : productCount}</h3>
                            <p className="text-muted small mb-0">Products Listed</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                            <h3 className="h4 fw-bold mb-1">{user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}</h3>
                            <p className="text-muted small mb-0">Member Since</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="row">
                <div className="col">
                    <h2 className="h6 fw-600 text-muted mb-3">Account actions</h2>
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/my-products')}
                        >
                            My Products
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={logout || undefined}
                            disabled={!logout}
                            title={!logout ? 'Logout not available' : 'Logout'}
                        >
                            Logout
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-warning"
                            onClick={() => navigate('/my-favorites')}
                        >
                            Favorite Products
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}