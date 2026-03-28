/**
 * Định dạng tiền tệ VNĐ
 * @param {number|string} amount 
 * @returns {string} (Ví dụ: 70.000 đ)
 */
export const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return parseInt(amount).toLocaleString('vi-VN') + ' đ';
};

/**
 * Định dạng ngày tháng
 * @param {string} dateString 
 * @returns {string} (Ví dụ: 28/03/2026)
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

/**
 * Định dạng ngày giờ chi tiết
 * @param {string} dateString 
 * @returns {string} (Ví dụ: 19:30 28/03/2026)
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
};

/**
 * Định dạng đếm ngược thời gian (Giây -> Phút:Giây)
 * @param {number} seconds 
 * @returns {string} (Ví dụ: 05:00)
 */
export const formatTimeLeft = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};