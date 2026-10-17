/**
 * Badge Component for movie tags, formats, status flags
 */
export default function Badge({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-semibold tracking-wide rounded-md uppercase select-none transition-colors';

  const variants = {
    gold: 'bg-cinema-gold/15 text-cinema-gold-light border border-cinema-gold/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    glass: 'bg-white/5 text-cinema-text backdrop-blur-md border border-white/10',
    dark: 'bg-cinema-surface-elevated text-cinema-text-muted border border-white/5',
    outline: 'bg-transparent text-cinema-text-muted border border-white/20',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.gold} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
