import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

const getErrorMessage = (error) => {
    if (!error.response) {
        return "Lỗi kết nối mạng. Vui lòng kiểm tra lại internet của bạn.";
    }

    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
        case 400: return message || "Dữ liệu không hợp lệ.";
        case 401: return "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.";
        case 403: return "Bạn không có quyền thực hiện hành động này.";
        case 404: return "Tài nguyên không tồn tại.";
        case 429: return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        case 500: return "Lỗi hệ thống phía Server. Vui lòng thử lại sau.";
        default: return message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
    }
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/refresh'
        ) {
            originalRequest._retry = true;
            try {
                const res = await axiosClient.post("/auth/refresh");
                const newAccessToken = res.accessToken;

                if (newAccessToken) {
                    localStorage.setItem("token", newAccessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        error.friendlyMessage = getErrorMessage(error);
        return Promise.reject(error);
    }
)

export default axiosClient;