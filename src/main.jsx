import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

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
        />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);