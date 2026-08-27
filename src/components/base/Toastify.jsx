import toast, { Toaster } from "react-hot-toast";

export const showToast = {
  success: (message, options) =>
    toast.success(message, {
      duration: 3000,
      ...options,
    }),
  error: (message, options) =>
    toast.error(message || "Đã có lỗi xảy ra", {
      duration: 4000,
      ...options,
    }),
  loading: (message, options) =>
    toast.loading(message, {
      ...options,
    }),
  dismiss: (toastId) => toast.dismiss(toastId),
};

export function Toastify() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "!bg-dark-card !text-white !border !border-dark-border !shadow-2xl text-sm font-medium",
        style: {
          borderRadius: "8px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}

export default Toastify;
