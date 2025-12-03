import React, { forwardRef } from 'react';

const sizes = { sm: 'form-control-sm', md: '', lg: 'form-control-lg' };

const Input = forwardRef(function Input({ size = 'md', isInvalid = false, className = '', ...props }, ref) {
    const s = sizes[size] ?? '';
    const invalid = isInvalid ? 'is-invalid' : '';
    return <input ref={ref} className={`form-control ${s} ${invalid} ${className}`.trim()} {...props} />;
});
export default Input;