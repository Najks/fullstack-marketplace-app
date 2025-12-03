import React from 'react';

export default function AboutPage() {
    return (
        <div className="container py-4">
            <h1 className="h3 mb-3">About the Marketplace</h1>
            <p className="text-muted">
                A modern marketplace connecting buyers and sellers with secure payments, clear policies,
                and fast discovery. Built for speed, trust, and growth.
            </p>

            <hr />

            <section className="mt-3">
                <h2 className="h5 mb-3">Who it serves</h2>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <h3 className="h6">For buyers</h3>
                                <ul className="mb-0">
                                    <li>Discover products with powerful search and filters</li>
                                    <li>Secure checkout and order tracking</li>
                                    <li>Ratings, reviews, and seller profiles</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <h3 className="h6">For sellers</h3>
                                <ul className="mb-0">
                                    <li>Simple listing creation and inventory updates</li>
                                    <li>Order management and analytics</li>
                                    <li>Payouts and dispute handling support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-4">
                <h2 className="h5">How it works</h2>
                <ol className="mb-0">
                    <li>Create an account and complete your profile</li>
                    <li>Browse products or list items for sale</li>
                    <li>Use secure checkout with protected payments</li>
                    <li>Track orders, communicate, and leave reviews</li>
                </ol>
            </section>

            <section className="mt-4">
                <h2 className="h5">Tech</h2>
                <p className="mb-0 text-muted">
                    React frontend, Node.js API, and SQL database. Uses modern tooling and accessible UI patterns.
                </p>
            </section>

            <section className="mt-4">
                <h2 className="h5">Contact</h2>
                <p className="mb-0">
                    Need help? Email <a href="mailto:marketplac@gmail.com">marketplac@gmail.com</a>.
                </p>
            </section>
        </div>
    );
}
