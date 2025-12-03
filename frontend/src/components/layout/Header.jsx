import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header() {
    const { loggedIn, user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold" style={{ fontSize: '1.5rem', letterSpacing: '0.5px' }}>
                    marketplac
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="mainNavbar">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/products" className="nav-link">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/categories" className="nav-link">Categories</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about" className="nav-link">About</Link>
                        </li>
                        {loggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link to="/create-product" className="nav-link">Create Product</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/my-favorites" className="nav-link">My Favorites</Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="d-flex align-items-center gap-2 ms-auto">
                        {!loggedIn && (
                            <Link to="/auth" className="btn btn-primary">
                                Login
                            </Link>
                        )}
                        {loggedIn && (
                            <>
                                <Link to="/my-products" className="btn btn-sm btn-outline-secondary" title="Your listings">
                                    <i className="bi bi-box-seam me-1"></i>My Products
                                </Link>
                                <Link to="/profile" className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-person-circle me-1"></i>
                                    {user?.first_name || user?.username} {user?.last_name || ''}
                                </Link>
                                <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}