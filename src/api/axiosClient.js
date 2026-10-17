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
        case 401: return message || "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.";
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const AUTH_SKIP_REFRESH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"];

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const isSkipUrl = AUTH_SKIP_REFRESH_URLS.some((url) =>
            originalRequest?.url?.includes(url)
        );

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isSkipUrl
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axiosClient.post("/auth/refresh");
                const newAccessToken = res?.accessToken || res?.data?.accessToken;

                if (!newAccessToken) {
                    throw new Error("Missing access token on refresh");
                }

                localStorage.setItem("token", newAccessToken);
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("token");
                const isProtectedPath = /^\/(booking|payment|history|profile|admin|staff)(\/|$)/.test(
                    window.location.pathname
                );
                if (isProtectedPath) {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        error.friendlyMessage = getErrorMessage(error);
        return Promise.reject(error);
    }
)

export default axiosClient;