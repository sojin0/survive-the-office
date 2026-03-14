import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './index.css';

if (import.meta.env.DEV) {
  const { seedHistory } = await import('./utils/seedHistory');
  seedHistory();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
