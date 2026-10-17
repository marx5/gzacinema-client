import { forwardRef } from 'react';

const Input = forwardRef(({
    type = 'text',
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon,
    size = 'md',
    className = '',
    containerClassName = '',
    disabled = false,
    ...props
}, ref) => {
    const sizeClasses = {
        sm: 'py-1.5 text-xs',
        md: 'py-2.5 text-sm',
        lg: 'py-3.5 text-base'
    };

    const paddingClasses = LeftIcon
        ? rightIcon
            ? 'pl-10 pr-10'
            : 'pl-10 pr-3.5'
        : rightIcon
        ? 'pl-3.5 pr-10'
        : 'px-3.5';

    return (
        <div className={`w-full space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {LeftIcon && (
                    <div className="pointer-events-none absolute left-3 flex items-center justify-center text-cinema-text-muted">
                        <LeftIcon className="h-4 w-4" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    disabled={disabled}
                    className={`w-full rounded-md border bg-cinema-surface font-medium text-cinema-text placeholder:text-cinema-text-dim outline-none focus:outline-none transition-[border-color,box-shadow] duration-150 ${
                        sizeClasses[size] || sizeClasses.md
                    } ${paddingClasses} ${
                        error
                            ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                            : 'border-white/10 focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold/60 hover:border-white/20'
                    } ${disabled ? 'opacity-50 cursor-not-allowed bg-cinema-surface-elevated/40' : ''} ${className}`}
                    style={{ outline: 'none' }}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 flex items-center justify-center text-cinema-text-muted">
                        {rightIcon}
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

Input.displayName = 'Input';

export default Input;
