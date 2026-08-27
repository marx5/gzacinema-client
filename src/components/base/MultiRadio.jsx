export function MultiRadio({
  name,
  options = [],
  value,
  onChange,
  label,
  error,
  direction = "horizontal",
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div
        className={`flex ${
          direction === "vertical" ? "flex-col gap-2.5" : "flex-wrap gap-4"
        }`}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300 hover:text-white"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              className="w-4 h-4 bg-dark-card border-dark-border text-brand-500 focus:ring-brand-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}

export default MultiRadio;
