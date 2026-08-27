import { Account } from "./Account";
import { Logo } from "../base/Logo";

export function Topbar({ title, children, showLogo = false, className = "" }) {
  return (
    <header className={`h-16 bg-dark-card/90 backdrop-blur-md border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-40 ${className}`}>
      <div className="flex items-center gap-4">
        {showLogo && <Logo size="sm" />}
        {title && <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {children}
        <Account />
      </div>
    </header>
  );
}

export default Topbar;
