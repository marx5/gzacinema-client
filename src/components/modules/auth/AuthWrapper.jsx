import Logo from "@/components/base/Logo";

export function AuthWrapper({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" className="mb-4" />
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="mt-6 pt-4 border-t border-dark-border/60 text-center text-xs text-text-secondary">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthWrapper;
