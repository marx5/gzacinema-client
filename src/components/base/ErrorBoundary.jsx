import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 text-center">
          <div className="glass-card max-w-lg rounded-2xl border border-red-500/20 p-8 shadow-cinematic">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mb-2 font-display text-2xl font-bold text-white">
              Đã xảy ra sự cố không mong muốn
            </h2>

            <p className="mb-6 text-sm text-cinema-text-muted">
              Hệ thống đã gặp lỗi trong quá trình xử lý giao diện. Bạn có thể thử tải lại trang hoặc quay về trang chủ.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-lg bg-cinema-surface-elevated px-5 py-2.5 text-sm font-semibold text-white border border-white/10 hover:border-cinema-gold/40 hover:text-cinema-gold transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Tải lại trang
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-lg bg-gold-gradient px-5 py-2.5 text-sm font-bold text-cinema-bg shadow-glow-gold-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
