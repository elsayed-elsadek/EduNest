// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).global = globalThis;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import GlobalLoadingOverlay from './loadingApp/GlobalLoadingOverlay';

import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/Websocketprovider';
import { NotificationsProvider } from './context/NotificationsContext';
import { CustomToaster } from './components/common/toaster/CustomToaster';
import ErrorBoundary from './components/common/ErrorBoundary';
import { reportError } from './utils/errorReporting';

// Last-resort reporting for unhandled promise rejections: nothing dies
// silently, and FE-021 will read from the same sink via reportError().
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, { extra: { source: 'unhandledrejection' } });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <WebSocketProvider>
          <NotificationsProvider>
            <GlobalLoadingOverlay />
            {/* Global fallback: only reached when the route-level boundary in
                App itself cannot recover. */}
            <ErrorBoundary>
              <App />
            </ErrorBoundary>

            {/* notifications toaster for all pages and important notifications */}
            <CustomToaster />
          </NotificationsProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);