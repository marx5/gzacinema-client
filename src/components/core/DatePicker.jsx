import { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import {
    DAYS_OF_WEEK,
    MONTH_NAMES,
    padZero,
    parseLocalDate,
    isSameDay,
    isToday,
    formatDateOutput,
    formatDisplayDate,
    buildCalendarGrid,
    calculatePopupPosition
} from './datePicker.utils';

const SIZE_CLASSES = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-3.5 text-sm',
    lg: 'py-3.5 px-4 text-base'
};

export default function DatePicker({
    value,
    onChange,
    showTime = false,
    label,
    placeholder,
    error,
    disabled = false,
    size = 'md',
    className = '',
    containerClassName = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const popupRef = useRef(null);
    const [popupCoords, setPopupCoords] = useState({ top: 0, left: 0, width: 320 });

    const initialDate = useMemo(() => parseLocalDate(value) || new Date(), [value]);
    const [viewDate, setViewDate] = useState(initialDate);
    const [tempTime, setTempTime] = useState({
        hours: initialDate.getHours(),
        minutes: initialDate.getMinutes()
    });

    // Khởi tạo viewDate và tempTime một lần khi mở popup
    const prevOpenRef = useRef(false);
    useEffect(() => {
        if (isOpen && !prevOpenRef.current) {
            const d = parseLocalDate(value) || new Date();
            setViewDate(d);
            setTempTime({ hours: d.getHours(), minutes: d.getMinutes() });
        }
        prevOpenRef.current = isOpen;
    }, [isOpen, value]);

    // Calculate position for floating portal popup
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPopupCoords(calculatePopupPosition(rect, showTime));
    }, [showTime]);

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, updatePosition]);

    // Handle click outside and reposition on scroll/resize
    useEffect(() => {
        if (!isOpen) return;

        const handleScrollOrResize = () => {
            updatePosition();
        };

        const handleClickOutside = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                popupRef.current && !popupRef.current.contains(e.target)
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

    // Calendar Calculations
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const calendarGrid = useMemo(() => buildCalendarGrid(year, month), [year, month]);
    const parsedValueDate = useMemo(() => parseLocalDate(value), [value]);

    const handlePrevMonth = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleSelectDay = (cellDate, isCurrentMonth) => {
        if (disabled) return;
        const target = new Date(cellDate);
        if (!isCurrentMonth) {
            setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
        }
        if (showTime) {
            target.setHours(tempTime.hours, tempTime.minutes, 0, 0);
        } else {
            target.setHours(0, 0, 0, 0);
        }

        const out = formatDateOutput(target, showTime);
        if (onChange) onChange(out);

        if (!showTime) {
            setIsOpen(false);
        }
    };

    const handleHourChange = (newHour) => {
        const h = parseInt(newHour, 10);
        setTempTime(prev => ({ ...prev, hours: h }));

        const base = parseLocalDate(value) || viewDate || new Date();
        const updated = new Date(base);
        updated.setHours(h, tempTime.minutes, 0, 0);

        const out = formatDateOutput(updated, showTime);
        if (onChange) onChange(out);
    };

    const handleMinuteChange = (newMinute) => {
        const m = parseInt(newMinute, 10);
        setTempTime(prev => ({ ...prev, minutes: m }));

        const base = parseLocalDate(value) || viewDate || new Date();
        const updated = new Date(base);
        updated.setHours(tempTime.hours, m, 0, 0);

        const out = formatDateOutput(updated, showTime);
        if (onChange) onChange(out);
    };

    const handleApplyDateTime = () => {
        const base = parseLocalDate(value) || viewDate || new Date();
        const updated = new Date(base);
        updated.setHours(tempTime.hours, tempTime.minutes, 0, 0);

        const out = formatDateOutput(updated, showTime);
        if (onChange) onChange(out);
        setIsOpen(false);
    };

    const handleQuickToday = () => {
        const now = new Date();
        setViewDate(now);
        setTempTime({ hours: now.getHours(), minutes: now.getMinutes() });
        const out = formatDateOutput(now, showTime);
        if (onChange) onChange(out);
        if (!showTime) setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) onChange('');
    };

    const displayVal = formatDisplayDate(value, showTime);

    return (
        <div className={`w-full space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Trigger Button */}
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (!isOpen) {
                            const d = parseLocalDate(value) || new Date();
                            setViewDate(d);
                            setTempTime({ hours: d.getHours(), minutes: d.getMinutes() });
                        }
                        updatePosition();
                        setIsOpen((prev) => !prev);
                    }}
                    className={`flex w-full items-center justify-between rounded-md border bg-cinema-surface text-left font-medium text-cinema-text transition-[border-color,box-shadow] duration-150 cursor-pointer ${
                        SIZE_CLASSES[size] || SIZE_CLASSES.md
                    } ${
                        isOpen
                            ? 'border-cinema-gold ring-1 ring-cinema-gold shadow-glow-gold-sm bg-cinema-surface-elevated'
                            : 'border-white/10 hover:border-white/20 hover:bg-cinema-surface-elevated/70'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                        error ? 'border-red-500 ring-1 ring-red-500' : ''
                    } ${className}`}
                    style={{ outline: 'none' }}
                >
                    <div className="flex items-center gap-2.5 truncate">
                        {showTime ? (
                            <Clock className="w-4 h-4 text-cinema-gold shrink-0" />
                        ) : (
                            <CalendarIcon className="w-4 h-4 text-cinema-gold shrink-0" />
                        )}
                        <span className={`truncate ${!displayVal ? 'text-cinema-text-dim' : 'text-cinema-text'}`}>
                            {displayVal || placeholder || (showTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY')}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {value && !disabled && (
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label="Xóa ngày đã chọn"
                                onClick={handleClear}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleClear(e);
                                    }
                                }}
                                className="p-0.5 rounded-md hover:bg-white/10 text-cinema-text-dim hover:text-cinema-text transition-colors"
                                title="Xóa"
                            >
                                <X className="w-3.5 h-3.5" />
                            </span>
                        )}
                        <CalendarIcon className="w-4 h-4 text-cinema-text-muted opacity-60" />
                    </div>
                </button>

                {/* Floating Portal Popup - Renders into document.body to avoid any overflow-hidden clipping */}
                {isOpen &&
                    createPortal(
                        <div
                            ref={popupRef}
                            style={{
                                position: 'fixed',
                                top: `${popupCoords.top}px`,
                                left: `${popupCoords.left}px`,
                                width: `${popupCoords.width}px`,
                                zIndex: 99999
                            }}
                            className="rounded-md border border-white/20 bg-cinema-surface/98 p-4 shadow-cinematic backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
                        >
                            {/* Month/Year Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1 rounded-md text-cinema-text-muted hover:text-cinema-gold hover:bg-white/5 transition-colors cursor-pointer"
                                    aria-label="Tháng trước"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="text-sm font-display font-bold text-cinema-text tracking-wide">
                                    {MONTH_NAMES[month]} <span className="text-cinema-gold">{year}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-1 rounded-md text-cinema-text-muted hover:text-cinema-gold hover:bg-white/5 transition-colors cursor-pointer"
                                    aria-label="Tháng sau"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                                {DAYS_OF_WEEK.map((wd, i) => (
                                    <div
                                        key={wd}
                                        className={`text-[11px] font-bold uppercase ${
                                            i >= 5 ? 'text-cinema-gold/70' : 'text-cinema-text-dim'
                                        }`}
                                    >
                                        {wd}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {calendarGrid.map(({ date, isCurrentMonth, dayNum }) => {
                                    const selected = isCurrentMonth && isSameDay(date, parsedValueDate);
                                    const today = isToday(date, isCurrentMonth);
                                    const cellKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${isCurrentMonth}`;

                                    return (
                                        <button
                                            key={cellKey}
                                            type="button"
                                            onClick={() => handleSelectDay(date, isCurrentMonth)}
                                            style={{ outline: 'none' }}
                                            className={`relative h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-md text-xs font-semibold cursor-pointer outline-none focus:outline-none transition-colors duration-75 ${
                                                selected
                                                    ? 'bg-gold-gradient text-cinema-bg font-extrabold shadow-glow-gold-sm'
                                                    : today
                                                    ? 'text-cinema-gold font-bold hover:bg-cinema-gold/15'
                                                    : isCurrentMonth
                                                    ? 'text-cinema-text hover:bg-white/10 hover:text-white'
                                                    : 'text-cinema-text-dim/30 hover:bg-white/5 hover:text-cinema-text-muted'
                                            }`}
                                        >
                                            <span className="leading-none">{dayNum}</span>
                                            {today && !selected && (
                                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cinema-gold pointer-events-none" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Picker Section (if showTime) */}
                            {showTime && (
                                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-cinema-text-muted">
                                        <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-cinema-gold">
                                            <Clock className="w-3.5 h-3.5" /> Giờ & Phút
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Hours selector */}
                                        <div className="flex items-center gap-1.5 bg-cinema-surface-elevated/80 border border-white/10 rounded-md px-2.5 py-1.5">
                                            <span className="text-[11px] text-cinema-text-dim">Giờ:</span>
                                            <select
                                                value={tempTime.hours}
                                                onChange={(e) => handleHourChange(e.target.value)}
                                                className="bg-transparent text-cinema-text font-bold text-xs focus:outline-none w-full cursor-pointer"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i} className="bg-cinema-surface text-cinema-text">
                                                        {padZero(i)} giờ
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Minutes selector */}
                                        <div className="flex items-center gap-1.5 bg-cinema-surface-elevated/80 border border-white/10 rounded-md px-2.5 py-1.5">
                                            <span className="text-[11px] text-cinema-text-dim">Phút:</span>
                                            <select
                                                value={tempTime.minutes}
                                                onChange={(e) => handleMinuteChange(e.target.value)}
                                                className="bg-transparent text-cinema-text font-bold text-xs focus:outline-none w-full cursor-pointer"
                                            >
                                                {Array.from({ length: 60 }, (_, i) => (
                                                    <option key={i} value={i} className="bg-cinema-surface text-cinema-text">
                                                        {padZero(i)} phút
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Quick Action Buttons */}
                            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={handleQuickToday}
                                    className="text-[11px] font-bold text-cinema-gold hover:text-cinema-gold-light transition-colors cursor-pointer"
                                >
                                    {showTime ? 'Bây giờ' : 'Hôm nay'}
                                </button>

                                {showTime && (
                                    <button
                                        type="button"
                                        onClick={handleApplyDateTime}
                                        className="inline-flex items-center gap-1 rounded-md bg-gold-gradient px-3 py-1 text-xs font-bold text-cinema-bg shadow-glow-gold-sm transition hover:brightness-110 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Xác nhận
                                    </button>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}
            </div>

            {error && (
                <p className="text-xs text-red-400 font-medium animate-in fade-in duration-150">
                    {error}
                </p>
            )}
        </div>
    );
}
