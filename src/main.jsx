import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';
import { Toaster, ToastBar, toast } from 'react-hot-toast';

import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '@/utils/queryClient';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={10}
          containerStyle={{
            top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
            right: 'clamp(10px, 2vw, 18px)',
            left: 'clamp(10px, 2vw, 18px)',
          }}
          toastOptions={{
            style: {
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '14px 18px',
              color: '#F8FAFC',
              backgroundColor: 'rgba(23, 24, 43, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px -5px rgba(234, 179, 8, 0.2)',
              borderRadius: '5px',
            },
            success: {
              style: {
                borderLeft: '4px solid #10B981',
              },
              iconTheme: {
                primary: '#10B981',
                secondary: '#0B0C16',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #EF4444',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#0B0C16',
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex w-full items-start gap-3">
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 pr-1">{message}</div>
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className="mt-0.5 shrink-0 text-base leading-none text-white/60 transition hover:text-white"
                    aria-label="Đóng thông báo"
                  >
                    ×
                  </button>
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);