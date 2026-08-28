import React, { forwardRef } from 'react';
import { formatNumber, parseNumber } from '@/utils/formatters';

const MoneyInput = forwardRef(({
    value = 0,
    onChange,
    label,
    error,
    helperText,
    suffix = 'VNĐ',
    placeholder = '0',
    size = 'md',
    className = '',
    containerClassName = '',
    disabled = false,
    required = false,
    min,
    max,
    ...props
}, ref) => {
    const sizeClasses = {
        sm: 'py-1.5 text-xs',
        md: 'py-2.5 text-sm',
        lg: 'py-3.5 text-base'
    };

    // Format display value: e.g. 70000 -> "70.000"
    const displayValue = value !== '' && value !== null && value !== undefined && !isNaN(Number(value)) && Number(value) > 0
        ? formatNumber(value)
        : value === 0
        ? '0'
        : '';

    const handleInputChange = (e) => {
        const rawText = e.target.value;
        // Strip everything except digits
        const digitsOnly = rawText.replace(/[^\d]/g, '');

        if (!digitsOnly) {
            if (onChange) onChange('');
            return;
        }

        let num = parseInt(digitsOnly, 10);
        if (isNaN(num)) num = 0;

        if (min !== undefined && num < min) {
            // Keep min constraint if needed or let user type
        }
        if (max !== undefined && num > max) {
            num = max;
        }

        if (onChange) {
            onChange(num);
        }
    };

    return (
        <div className={`w-full space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                <input
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    required={required}
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`w-full rounded-md border bg-cinema-surface pl-3.5 pr-14 font-medium text-cinema-text placeholder:text-cinema-text-dim outline-none focus:outline-none transition-[border-color,box-shadow] duration-150 ${
                        sizeClasses[size] || sizeClasses.md
                    } ${
                        error
                            ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                            : 'border-white/10 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/60 hover:border-white/20'
                    } ${disabled ? 'opacity-50 cursor-not-allowed bg-cinema-surface-elevated/40' : ''} ${className}`}
                    style={{ outline: 'none' }}
                    {...props}
                />

                {suffix && (
                    <div className="pointer-events-none absolute right-3 flex items-center justify-center">
                        <span className="text-xs font-bold text-cinema-gold tracking-wider">
                            {suffix}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-400 font-medium animate-in fade-in duration-150">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-[11px] text-cinema-text-dim">
                    {helperText}
                </p>
            )}
        </div>
    );
});

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
