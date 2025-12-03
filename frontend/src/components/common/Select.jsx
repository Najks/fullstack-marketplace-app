import React, { forwardRef } from 'react';

const sizes = { sm: 'form-select-sm', md: '', lg: 'form-select-lg' };

const Select = forwardRef(function Select({ size = 'md', isInvalid = false, className = '', children, ...props }, ref) {
    const s = sizes[size] ?? '';
    const invalid = isInvalid ? 'is-invalid' : '';
    return (
        <select ref={ref} className={`form-select ${s} ${invalid} ${className}`.trim()} {...props}>
            {children}
        </select>
    );
});
export default Select;
