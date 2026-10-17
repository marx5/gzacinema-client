import { createContext, useContext, useEffect } from 'react';
import { X } from 'lucide-react';

const ModalContext = createContext(null);

export function Modal({ isOpen, onClose, children, className = '' }) {
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          className={`relative z-10 w-full max-w-2xl rounded-t-2xl sm:rounded-xl glass-card bg-cinema-surface/95 border border-white/10 shadow-cinematic transform transition-all animate-scaleUp overflow-hidden ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

Modal.Header = function ModalHeader({ children, className = '' }) {
  const { onClose } = useContext(ModalContext);
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 ${className}`}>
      {children}
      <button
        onClick={onClose}
        className="p-2 rounded-xl text-cinema-text-muted hover:text-white hover:bg-white/10 transition cursor-pointer"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

Modal.Title = function ModalTitle({ children, className = '' }) {
  return <h3 className={`text-xl font-bold text-cinema-text ${className}`}>{children}</h3>;
};

Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`p-6 max-h-[75vh] overflow-y-auto ${className}`}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20 ${className}`}>{children}</div>;
};

export default Modal;
