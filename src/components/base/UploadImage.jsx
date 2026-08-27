import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export function UploadImage({
  value,
  onChange,
  onRemove,
  label,
  error,
  aspectRatio = "aspect-[2/3]",
  className = "",
  placeholder = "Kéo thả hoặc nhấn để chọn ảnh",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)");
      return;
    }
    onChange?.(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Preview URL if value is File object or string URL
  const previewUrl =
    typeof value === "string"
      ? value
      : value instanceof File
      ? URL.createObjectURL(value)
      : null;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg overflow-hidden transition-all flex flex-col items-center justify-center text-center ${aspectRatio} ${
          isDragging
            ? "border-brand-500 bg-brand-500/10"
            : error
            ? "border-danger-500 bg-danger-500/5"
            : "border-dark-border bg-dark-card hover:border-gray-500"
        } ${!previewUrl ? "cursor-pointer" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-medium transition"
              >
                Đổi ảnh
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  onRemove?.();
                }}
                className="p-1.5 bg-danger-500 hover:bg-danger-600 text-white rounded transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="p-3 rounded-full bg-dark-surface text-brand-500">
              <Upload size={24} />
            </div>
            <p className="text-xs text-text-secondary font-medium">{placeholder}</p>
            <p className="text-[11px] text-gray-500">PNG, JPG, WEBP tối đa 5MB</p>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}

export default UploadImage;
