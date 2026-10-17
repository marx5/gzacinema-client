/**
 * Button component following explicit variants & composition.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cinema-gold focus:ring-offset-2 focus:ring-offset-cinema-bg disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const variants = {
    primary: 'bg-gold-gradient text-cinema-bg font-bold shadow-glow-gold hover:shadow-glow-gold-sm hover:brightness-110 border border-cinema-gold-light/40',
    secondary: 'bg-cinema-surface hover:bg-cinema-surface-hover text-cinema-text border border-white/10 hover:border-cinema-gold/40 shadow-card',
    ghost: 'bg-transparent hover:bg-white/5 text-cinema-text-muted hover:text-cinema-text',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    outline: 'bg-transparent border border-white/20 hover:border-cinema-gold text-cinema-text hover:text-cinema-gold',
    glass: 'glass-card text-cinema-text hover:border-cinema-gold/50 shadow-card hover:bg-cinema-surface-elevated/80',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold min-h-[48px]',
    icon: 'p-2.5 min-w-[40px] min-h-[40px] aspect-square rounded-full',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}

export default Button;

