import AppRouter from "./router";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <AppRouter />
    </>
  )
}