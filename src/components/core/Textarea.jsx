import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
    label,
    error,
    helperText,
    rows = 3,
    className = '',
    containerClassName = '',
    disabled = false,
    ...props
}, ref) => {
    return (
        <div className={`w-full space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                rows={rows}
                disabled={disabled}
                className={`w-full rounded-md border bg-cinema-surface p-3.5 text-sm font-medium text-cinema-text placeholder:text-cinema-text-dim outline-none focus:outline-none transition-[border-color,box-shadow] duration-150 resize-y ${
                    error
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                        : 'border-white/10 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/60 hover:border-white/20'
                } ${disabled ? 'opacity-50 cursor-not-allowed bg-cinema-surface-elevated/40' : ''} ${className}`}
                style={{ outline: 'none' }}
                {...props}
            />

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

Textarea.displayName = 'Textarea';

export default Textarea;
