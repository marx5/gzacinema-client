import AppRouter from "./router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ErrorBoundary } from "@/components/base/ErrorBoundary";

export default function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}