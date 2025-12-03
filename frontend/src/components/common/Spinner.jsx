import React from 'react';

export default function Spinner({ variant = 'primary', size = 'md', type = 'border', className = '' }) {
    const cls = type === 'grow' ? 'spinner-grow' : 'spinner-border';
    const sz = size === 'sm' ? `${cls}-sm` : '';
    return (
        <div className={`${cls} ${sz} text-${variant} ${className}`.trim()} role="status" aria-live="polite" aria-busy="true">
            <span className="visually-hidden">Loading...</span>
        </div>
    );
}