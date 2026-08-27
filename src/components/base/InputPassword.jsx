import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export const InputPassword = forwardRef(function InputPassword(
  { label, error, helperText, className = "", ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`w-full bg-dark-card border border-dark-border rounded-md px-3.5 py-2.5 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm ${
            error ? "!border-danger-500" : ""
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

export default InputPassword;
