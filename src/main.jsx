import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';
import { Toaster, ToastBar, toast } from 'react-hot-toast';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

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
              border: '1px solid #ddcbb6',
              padding: '16px',
              color: '#3b2b19',
              backgroundColor: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '600',
              boxShadow: '0 8px 22px rgba(76,45,17,0.12)',
              borderRadius: '4px',
            },
            success: {
              style: {
                borderLeft: '4px solid #1f8d52',
              },
              iconTheme: {
                primary: '#1f8d52',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #b0232f',
              },
              iconTheme: {
                primary: '#b0232f',
                secondary: '#fff',
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
                    className="mt-0.5 shrink-0 text-base leading-none text-[#7b6446] transition hover:text-[#3b2b19]"
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