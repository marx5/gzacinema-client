/**
 * Định dạng tiền tệ VNĐ
 * @param {number|string} amount 
 * @param {string} suffix - Đơn vị hiển thị (mặc định: 'đ')
 * @returns {string} (Ví dụ: 70.000 đ hoặc 70.000 VNĐ)
 */
export const formatCurrency = (amount, suffix = 'đ') => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return `0 ${suffix}`;
    const num = Math.round(Number(amount));
    return `${num.toLocaleString('vi-VN')} ${suffix}`.trim();
};

/**
 * Định dạng số có phân cách hàng nghìn bằng dấu chấm
 * @param {number|string} num 
 * @returns {string} (Ví dụ: 70.000)
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) return '0';
    return Math.round(Number(num)).toLocaleString('vi-VN');
};

/**
 * Chuyển đổi chuỗi số (có thể chứa dấu chấm/phẩy) về số nguyên
 * @param {string|number} str 
 * @returns {number}
 */
export const parseNumber = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const cleanStr = String(str).replace(/[^\d]/g, '');
    return parseInt(cleanStr, 10) || 0;
};

/**
 * Định dạng ngày tháng
 * @param {string|Date} dateString 
 * @returns {string} (Ví dụ: 28/03/2026)
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

/**
 * Định dạng ngày giờ chi tiết
 * @param {string|Date} dateString 
 * @returns {string} (Ví dụ: 19:30 28/03/2026)
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${hh}:${mm} ${d}/${m}/${y}`;
};

/**
 * Định dạng giờ phút
 * @param {string|Date} dateString 
 * @returns {string} (Ví dụ: 19:30)
 */
export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
};

/**
 * Định dạng thời lượng phim (phút -> X giờ Y phút hoặc X phút)
 * @param {number} minutes 
 * @returns {string} (Ví dụ: 120 phút hoặc 2h 00m)
 */
export const formatDuration = (minutes) => {
    if (!minutes || isNaN(Number(minutes))) return '0 phút';
    const mins = Number(minutes);
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} giờ`;
};

/**
 * Định dạng đếm ngược thời gian (Giây -> Phút:Giây)
 * @param {number} seconds 
 * @returns {string} (Ví dụ: 05:00)
 */
export const formatTimeLeft = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Chuyển đổi Date sang chuỗi ngày theo múi giờ địa phương (YYYY-MM-DD)
 * @param {Date|string|number} dateInput 
 * @returns {string} (Ví dụ: 2026-03-28)
 */
export const toLocalDateString = (dateInput = new Date()) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};