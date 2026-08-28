import { Toastify } from "@/components/base/Toastify";

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toastify />
    </>
  );
}

export default ToastProvider;
