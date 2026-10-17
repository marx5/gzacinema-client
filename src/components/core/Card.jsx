/**
 * Card compound component implementing Vercel Composition Patterns
 */
export function Card({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`rounded-2xl glass-card overflow-hidden transition-all duration-300 ${
        hoverable ? 'glass-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-5 border-b border-white/5 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-bold text-cinema-text tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-cinema-text-muted mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

Card.Content = function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
