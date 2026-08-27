import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function ImagePreviewGallery({ images = [], initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="max-w-4xl max-h-[85vh] p-4 flex flex-col items-center">
        <img
          src={images[currentIndex]}
          alt={`Preview ${currentIndex + 1}`}
          className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
        />
        {images.length > 1 && (
          <p className="mt-3 text-sm text-gray-400 font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}

export default ImagePreviewGallery;
