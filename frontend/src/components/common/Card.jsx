import React from 'react';

export function Card({ className = '', children }) {
    return <div className={`card ${className}`.trim()}>{children}</div>;
}
export function CardHeader({ className = '', children }) {
    return <div className={`card-header ${className}`.trim()}>{children}</div>;
}
export function CardBody({ className = '', children }) {
    return <div className={`card-body ${className}`.trim()}>{children}</div>;
}
export function CardFooter({ className = '', children }) {
    return <div className={`card-footer ${className}`.trim()}>{children}</div>;
}