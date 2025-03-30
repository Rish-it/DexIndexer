import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import { MantineColorSchemeManager } from '@mantine/core'
import '@mantine/core/styles.css';
import App from './App.tsx'
import './index.css'

const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
});

function Main() {
  // Use localStorage to save and load color scheme preference
  const colorSchemeManager: MantineColorSchemeManager = {
    get: () => (localStorage.getItem('color-scheme') as 'light' | 'dark') || 'light',
    set: (colorScheme) => localStorage.setItem('color-scheme', colorScheme),
    subscribe: (callback) => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'color-scheme') {
          callback(event.newValue as 'light' | 'dark');
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    },
    clear: () => localStorage.removeItem('color-scheme'),
    unsubscribe: () => {}, // No-op function to satisfy the interface
  };

  return (
    <React.StrictMode>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />);
