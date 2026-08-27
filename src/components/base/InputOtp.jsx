import { useRef, useEffect } from "react";

export function InputOtp({ length = 6, value = "", onChange, error, disabled = false }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const newOtp = value.split("");
      newOtp[index] = "";
      onChange?.(newOtp.join(""));
      return;
    }

    const lastChar = val.slice(-1);
    const newOtp = (value + " ".repeat(length)).slice(0, length).split("");
    newOtp[index] = lastChar;
    const result = newOtp.join("").trimEnd();
    onChange?.(result);

    if (index < length - 1 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasteData) {
      onChange?.(pasteData);
      const nextIndex = Math.min(pasteData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[idx] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`w-12 h-14 text-center text-xl font-bold bg-dark-card border rounded-lg text-white transition-all focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${
              error ? "border-danger-500" : "border-dark-border"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-danger-500 text-center mt-1">{error}</p>}
    </div>
  );
}

export default InputOtp;
