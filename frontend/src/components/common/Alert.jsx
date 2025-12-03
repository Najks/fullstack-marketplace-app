import React from 'react';

export default function Alert({ variant = 'primary', dismissible = false, onClose, children, className = '' }) {
    return (
        <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible fade show' : ''} ${className}`.trim()} role="alert">
            {children}
            {dismissible && (
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            )}
        </div>
    );
}
