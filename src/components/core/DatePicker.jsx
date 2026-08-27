import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

function padZero(num) {
    return String(num).padStart(2, '0');
}

function parseDateValue(val) {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}

function formatDateOutput(date, showTime) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = padZero(date.getMonth() + 1);
    const d = padZero(date.getDate());
    if (!showTime) {
        return `${y}-${m}-${d}`;
    }
    const hh = padZero(date.getHours());
    const mm = padZero(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
}

function formatDisplayDate(val, showTime) {
    const date = parseDateValue(val);
    if (!date) return '';
    const d = padZero(date.getDate());
    const m = padZero(date.getMonth() + 1);
    const y = date.getFullYear();
    if (!showTime) {
        return `${d}/${m}/${y}`;
    }
    const hh = padZero(date.getHours());
    const mm = padZero(date.getMinutes());
    return `${d}/${m}/${y} ${hh}:${mm}`;
}

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

    const initialDate = useMemo(() => parseDateValue(value) || new Date(), [value]);
    const [viewDate, setViewDate] = useState(initialDate);
    const [tempTime, setTempTime] = useState({
        hours: initialDate.getHours(),
        minutes: initialDate.getMinutes()
    });

    // Khởi tạo viewDate và tempTime một lần khi mở popup
    const prevOpenRef = useRef(false);
    useEffect(() => {
        if (isOpen && !prevOpenRef.current) {
            const d = parseDateValue(value) || new Date();
            setViewDate(d);
            setTempTime({ hours: d.getHours(), minutes: d.getMinutes() });
        }
        prevOpenRef.current = isOpen;
    }, [isOpen, value]);

    // Calculate position for floating portal popup
    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const popupWidth = showTime ? 340 : 310;
        const popupHeight = showTime ? 390 : 330;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;

        let top = openUpwards ? rect.top - popupHeight - 6 : rect.bottom + 6;
        let left = rect.left;

        // Ensure popup doesn't overflow horizontal screen edges
        if (left + popupWidth > window.innerWidth - 12) {
            left = window.innerWidth - popupWidth - 12;
        }
        if (left < 12) left = 12;

        setPopupCoords({ top, left, width: popupWidth, openUpwards });
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, showTime]);

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
    }, [isOpen]);

    const sizeClasses = {
        sm: 'py-1.5 px-3 text-xs',
        md: 'py-2.5 px-3.5 text-sm',
        lg: 'py-3.5 px-4 text-base'
    };

    // Calendar Calculations
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let firstDayIndex = firstDayOfMonth.getDay() - 1;
        if (firstDayIndex === -1) firstDayIndex = 6;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const currentMonthDays = lastDayOfMonth.getDate();

        const cells = [];

        // Previous month days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const dateObj = new Date(year, month - 1, dayNum);
            cells.push({ date: dateObj, isCurrentMonth: false, dayNum });
        }

        // Current month days
        for (let d = 1; d <= currentMonthDays; d++) {
            const dateObj = new Date(year, month, d);
            cells.push({ date: dateObj, isCurrentMonth: true, dayNum: d });
        }

        // Next month days
        const totalCells = cells.length <= 35 ? 35 : 42;
        const nextDays = totalCells - cells.length;
        for (let d = 1; d <= nextDays; d++) {
            const dateObj = new Date(year, month + 1, d);
            cells.push({ date: dateObj, isCurrentMonth: false, dayNum: d });
        }

        return cells;
    }, [year, month]);

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

        const base = parseDateValue(value) || viewDate || new Date();
        const updated = new Date(base);
        updated.setHours(h, tempTime.minutes, 0, 0);

        const out = formatDateOutput(updated, showTime);
        if (onChange) onChange(out);
    };

    const handleMinuteChange = (newMinute) => {
        const m = parseInt(newMinute, 10);
        setTempTime(prev => ({ ...prev, minutes: m }));

        const base = parseDateValue(value) || viewDate || new Date();
        const updated = new Date(base);
        updated.setHours(tempTime.hours, m, 0, 0);

        const out = formatDateOutput(updated, showTime);
        if (onChange) onChange(out);
    };

    const handleApplyDateTime = () => {
        const base = parseDateValue(value) || viewDate || new Date();
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

    const isSelectedDay = (d, isCurrentMonth) => {
        if (!isCurrentMonth) return false;
        const valDate = parseDateValue(value);
        if (!valDate) return false;
        return (
            d.getFullYear() === valDate.getFullYear() &&
            d.getMonth() === valDate.getMonth() &&
            d.getDate() === valDate.getDate()
        );
    };

    const isToday = (d, isCurrentMonth) => {
        if (!isCurrentMonth) return false;
        const today = new Date();
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
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
                            const d = parseDateValue(value) || new Date();
                            setViewDate(d);
                            setTempTime({ hours: d.getHours(), minutes: d.getMinutes() });
                        }
                        updatePosition();
                        setIsOpen((prev) => !prev);
                    }}
                    className={`flex w-full items-center justify-between rounded-md border bg-cinema-surface text-left font-medium text-cinema-text transition-[border-color,box-shadow] duration-150 cursor-pointer ${
                        sizeClasses[size] || sizeClasses.md
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
                            <div
                                onClick={handleClear}
                                className="p-0.5 rounded-md hover:bg-white/10 text-cinema-text-dim hover:text-cinema-text transition-colors"
                                title="Xóa"
                            >
                                <X className="w-3.5 h-3.5" />
                            </div>
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
                                    {MONTHS[month]} <span className="text-cinema-gold">{year}</span>
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
                                {WEEKDAYS.map((wd, i) => (
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
                                    const selected = isSelectedDay(date, isCurrentMonth);
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
