/**
 * Tối ưu URL hình ảnh từ Cloudinary
 * @param {string} url - URL gốc từ Cloudinary
 * @param {number} width - Chiều rộng mong muốn (default: 300px)
 * @returns {string} - URL đã tối ưu hoặc URL gốc nếu không phải Cloudinary
 */
const optimizeCloudinaryUrl = (url, width = 300) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    const [base, filename] = url.split('/v');
    return `${base}/q_auto,f_auto,w_${width}/v${filename}`;
};

export { optimizeCloudinaryUrl };
