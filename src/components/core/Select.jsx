import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
    options = [],
    value,
    onChange,
    placeholder = '-- Chọn một mục --',
    label,
    icon: Icon,
    disabled = false,
    className = '',
    containerClassName = '',
    error,
    size = 'md'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const popupRef = useRef(null);
    const [popupCoords, setPopupCoords] = useState({ top: 0, left: 0, width: 200 });

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const popupHeight = Math.min(options.length * 40 + 20, 240);

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;

        let top = openUpwards ? rect.top - popupHeight - 4 : rect.bottom + 4;
        let left = rect.left;

        setPopupCoords({
            top,
            left,
            width: rect.width,
            maxHeight: 240
        });
    }, [options.length]);

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;

        const handleScrollOrResize = () => {
            updatePosition();
        };

        const handleClickOutside = (event) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target) &&
                popupRef.current && !popupRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen, updatePosition]);

    // Find selected option
    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const handleSelect = (val) => {
        if (disabled) return;
        onChange(val);
        setIsOpen(false);
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-3.5 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    return (
        <div className={`w-full space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                    {Icon && <Icon className="w-3.5 h-3.5 text-cinema-gold" />}
                    <span>{label}</span>
                </label>
            )}

            <div className="relative w-full">
                {/* Trigger Button */}
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        updatePosition();
                        setIsOpen((prev) => !prev);
                    }}
                    className={`flex w-full items-center justify-between rounded-md border bg-cinema-surface text-left font-medium text-cinema-text transition-all duration-200 cursor-pointer ${
                        sizeClasses[size] || sizeClasses.md
                    } ${
                        isOpen
                            ? 'border-cinema-gold ring-1 ring-cinema-gold shadow-glow-gold-sm bg-cinema-surface-elevated'
                            : 'border-white/10 hover:border-white/20 hover:bg-cinema-surface-elevated/70'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                        error ? 'border-red-500 ring-1 ring-red-500' : ''
                    } ${className}`}
                    style={{ outline: 'none' }}
                    aria-expanded={isOpen}
                >
                    <span className={`truncate ${!selectedOption && !value ? 'text-cinema-text-dim' : 'text-cinema-text'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-cinema-text-muted transition-transform duration-200 ml-2 ${
                            isOpen ? 'rotate-180 text-cinema-gold' : ''
                        }`}
                    />
                </button>

                {/* Options Dropdown Menu Portal */}
                {isOpen &&
                    createPortal(
                        <div
                            ref={popupRef}
                            style={{
                                position: 'fixed',
                                top: `${popupCoords.top}px`,
                                left: `${popupCoords.left}px`,
                                width: `${popupCoords.width}px`,
                                maxHeight: `${popupCoords.maxHeight}px`,
                                zIndex: 99999
                            }}
                            className="overflow-y-auto rounded-md border border-white/20 bg-cinema-surface/98 p-1 shadow-cinematic backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 custom-scrollbar"
                        >
                            {options.length === 0 ? (
                                <div className="p-3 text-center text-xs text-cinema-text-dim">
                                    Không có tùy chọn nào
                                </div>
                            ) : (
                                options.map((option) => {
                                    const isSelected = String(option.value) === String(value);
                                    return (
                                        <button
                                            key={String(option.value)}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                                                isSelected
                                                    ? 'bg-cinema-gold/15 text-cinema-gold font-bold'
                                                    : 'text-cinema-text-muted hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <span className="truncate">{option.label}</span>
                                            {isSelected && <Check className="h-4 w-4 text-cinema-gold shrink-0 ml-2" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>,
                        document.body
                    )}
            </div>

            {error && <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>}
        </div>
    );
}
