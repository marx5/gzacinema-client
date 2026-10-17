export const DAYS_OF_WEEK = Object.freeze(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);

export const MONTH_NAMES = Object.freeze([
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]);

export function padZero(num) {
    return String(num).padStart(2, '0');
}

export function parseLocalDate(val) {
    if (!val) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const d = new Date(`${val}T00:00:00`);
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}

export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
    const firstDayIndex = new Date(year, month, 1).getDay() - 1;
    return firstDayIndex === -1 ? 6 : firstDayIndex;
}

export function isSameDay(dateA, dateB) {
    if (!dateA || !dateB) return false;
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}

export function isToday(date, isCurrentMonth = true) {
    if (!isCurrentMonth || !date) return false;
    return isSameDay(date, new Date());
}

export function formatDateOutput(date, showTime) {
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

export function formatDisplayDate(val, showTime) {
    const date = parseLocalDate(val);
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

export function buildCalendarGrid(year, month) {
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const currentMonthDays = getDaysInMonth(year, month);

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
}

export function calculatePopupPosition(rect, showTime) {
    const popupWidth = showTime ? 340 : 310;
    const popupHeight = showTime ? 390 : 330;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;

    const top = openUpwards ? rect.top - popupHeight - 6 : rect.bottom + 6;
    let left = rect.left;

    if (left + popupWidth > window.innerWidth - 12) {
        left = window.innerWidth - popupWidth - 12;
    }
    if (left < 12) left = 12;

    return { top, left, width: popupWidth, openUpwards };
}
