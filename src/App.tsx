import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { LoginScreen } from './components/LoginScreen';
import { AppHeader } from './components/AppHeader';
import { MainLayout } from './components/MainLayout';
import { SurvivalResult } from './components/SurvivalResult';
import { RetireConfirmModal } from './components/TimelinePanel';
import './styles/weather-bg.css';

const WEATHER_IDS = ['sunny', 'cloudy_sunny', 'cloudy', 'rainy', 'stormy', 'dead'] as const;

function App() {
  const userName = useAuthStore((s) => s.userName);
  const isRetired = useAppStore((s) => s.isRetired);
  const isViewingDashboard = useAppStore((s) => s.isViewingDashboard);
  const weatherState = useAppStore((s) => s.weatherState);
  const hydrate = useAppStore((s) => s.hydrate);
  const retire = useAppStore((s) => s.retire);
  const hp = useAppStore((s) => s.hp);

  const [showRetireConfirm, setShowRetireConfirm] = useState(false);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);
  useEffect(() => { hydrate(); }, [hydrate]);

  const isLoggedIn = userName.length > 0;
  const isDarkWeather = weatherState === 'stormy' || weatherState === 'dead';

  // 퇴근했지만 대시보드 보기 모드면 MainLayout 표시
  const showDashboard = !isRetired || isViewingDashboard;

  if (!isLoggedIn) {
    return (
      <main className="font-sans min-h-screen">
        <LoginScreen />
      </main>
    );
  }

  return (
    <main className={`font-sans min-h-screen relative ${isDarkWeather ? 'weather-text-dark text-white' : 'text-[var(--color-text-primary)]'}`}>
      {/* 날씨 배경 레이어 */}
      {WEATHER_IDS.map((id) => (
        <div
          key={id}
          className={`weather-bg-layer ${id}`}
          style={{ opacity: weatherState === id ? 1 : 0 }}
          aria-hidden
        />
      ))}

      <div className="relative z-10">
        <AppHeader />
        {showDashboard ? <MainLayout /> : <SurvivalResult />}
      </div>

      {/* 퇴근하기 버튼 — 모바일 전용 */}
      {!isViewingDashboard && (
        <div className="md:hidden fixed left-0 right-0 flex justify-center px-4 z-50" style={{ bottom: 68 }}>
          <AnimatePresence>
            {showRetireConfirm && (
              <RetireConfirmModal
                hp={hp}
                onConfirm={() => { retire(); setShowRetireConfirm(false); }}
                onCancel={() => setShowRetireConfirm(false)}
              />
            )}
          </AnimatePresence>
          {!showRetireConfirm && (
            <button
              type="button"
              onClick={() => !isRetired && setShowRetireConfirm(true)}
              disabled={isRetired}
              className="w-full max-w-sm py-3.5 rounded-[var(--radius-full)] font-bold text-base transition-all duration-200 active:scale-[0.98] focus:outline-none disabled:cursor-not-allowed"
              style={{
                background: isRetired ? 'rgba(0,0,0,0.12)' : 'var(--color-btn-primary-bg)',
                color: isRetired ? 'var(--color-text-muted)' : 'var(--color-btn-primary-text)',
                boxShadow: isRetired ? 'none' : '0 4px 24px rgba(0,0,0,0.25)',
              }}
              data-testid="btn-checkout-mobile"
            >
              {isRetired ? '🌙 오늘 퇴근 완료!' : '🚪 퇴근하기'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export default App;