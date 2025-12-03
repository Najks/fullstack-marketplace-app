import React from "react";

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-info',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-outline-secondary',
};

const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

export default function Button({
                                   as: As = 'button',
                                   variant = 'primary',
                                   size = 'md',
                                   className = '',
                                   ...props
                               }) {
    const v = variants[variant] ?? variants.primary;
    const s = sizes[size] ?? '';
    const base = 'btn';
    return <As className={`${base} ${v} ${s} ${className}`.trim()} {...props} />;
}