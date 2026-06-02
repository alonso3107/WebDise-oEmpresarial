// ============================================================
// BoticaVR — Punto de entrada
// React 19 + React Router + Tailwind CSS v4
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { Provider } from './components/ui/provider';
import router from './routes';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Frick', system-ui, sans-serif",
            fontSize: '14px',
          },
        }}
      />
    </Provider>
  </StrictMode>,
);
