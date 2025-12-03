import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-auto py-4 bg-light border-top">
            <div className="container d-flex justify-content-between align-items-center">
                <span className="text-muted">© {new Date().getFullYear()} Marketplac</span>
                <nav className="d-flex gap-3">
                    <a href="#" className="text-muted">Privacy</a>
                    <a href="#" className="text-muted">Terms</a>
                    <a href="#" className="text-muted">Contact</a>
                </nav>
            </div>
        </footer>
    );
}