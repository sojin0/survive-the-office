import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './index.css';

// 기존 시드 데이터 정리
import { getHistory, setHistory } from './utils/storage';

const history = getHistory();
const cleaned = Object.fromEntries(
  Object.entries(history).filter(([, record]: any) =>
    !record.eventLog?.some((e: any) => e.id?.startsWith('seed-'))
  )
);
setHistory(cleaned);
localStorage.removeItem('survive-office-seed-version');


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);