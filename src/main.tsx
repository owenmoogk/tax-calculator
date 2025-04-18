import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Router>
      <MantineProvider defaultColorScheme="light">
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </MantineProvider>
    </Router>
  </StrictMode>
);
