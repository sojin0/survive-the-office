import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { LoginScreen } from './components/LoginScreen';
import { AppHeader } from './components/AppHeader';
import { MainLayout } from './components/MainLayout';
import { SurvivalResult } from './components/SurvivalResult';
import { RetireConfirmModal } from './components/TimelinePanel';
import type { WeatherState } from './types';
import './styles/weather-bg.css';

const WEATHER_IDS = ['sunny', 'cloudy_sunny', 'cloudy', 'rainy', 'stormy', 'dead'] as const;

function App() {
  const userName = useAuthStore((s) => s.userName);
  const isRetired = useAppStore((s) => s.isRetired);
  const isViewingDashboard = useAppStore((s) => s.isViewingDashboard);
  const myWeatherState = useAppStore((s) => s.weatherState);
  const hydrate = useAppStore((s) => s.hydrate);
  const retire = useAppStore((s) => s.retire);
  const hp = useAppStore((s) => s.hp);
  const unretire = useAppStore((s) => s.unretire);

  // 현재 표시할 날씨 (탭에 따라 MainLayout이 업데이트)
  const [displayWeather, setDisplayWeather] = useState<WeatherState>(myWeatherState);

  const [showRetireConfirm, setShowRetireConfirm] = useState(false);
  const [showUnretireConfirm, setShowUnretireConfirm] = useState(false);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);
  useEffect(() => { hydrate(); }, [hydrate]);

  // 내 날씨가 바뀌면 displayWeather도 동기화
  useEffect(() => { setDisplayWeather(myWeatherState); }, [myWeatherState]);

  const isLoggedIn = userName.length > 0;
  const isDarkWeather = displayWeather === 'stormy' || displayWeather === 'dead';
  const showDashboard = !isRetired || isViewingDashboard;

  if (!isLoggedIn) {
    return (
      <main className="font-sans min-h-screen">
        <LoginScreen />
      </main>
    );
  }

  return (
    <main
      className={`font-sans relative overflow-hidden ${isDarkWeather ? 'weather-text-dark text-white' : 'text-[var(--color-text-primary)]'}`}
      style={{ height: '100vh' }}
    >
      {/* 날씨 배경 */}
      <div className="weather-bg-wrap" aria-hidden>
        {WEATHER_IDS.map((id) => (
          <div
            key={id}
            className={`weather-bg-layer ${id}`}
            style={{ opacity: displayWeather === id ? 1 : 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col" style={{ height: '100vh' }}>
        <AppHeader />
        <div className="flex-1 min-h-0 overflow-hidden">
          {showDashboard
            ? <MainLayout onWeatherChange={setDisplayWeather} />
            : <SurvivalResult />}
        </div>
      </div>

      {/* 퇴근하기 버튼 — 모바일 전용 */}
      {!isViewingDashboard && !isRetired && (
        <div
          className="md:hidden fixed left-0 right-0 flex justify-center px-4 z-50"
          style={{ bottom: `calc(var(--bottomnav-height) + 12px)` }}
        >
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
              onClick={() => setShowRetireConfirm(true)}
              className="w-full max-w-sm py-3.5 rounded-[var(--radius-full)] font-bold text-base transition-all duration-200 active:scale-[0.98] focus:outline-none"
              style={{
                background: 'var(--color-btn-primary-bg)',
                color: 'var(--color-btn-primary-text)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}
              data-testid="btn-checkout-mobile"
            >
              🚪 퇴근하기
            </button>
          )}
        </div>
      )}

      {/* 퇴근 번복 버튼 — 모바일 전용 */}
      {isRetired && showDashboard && (
        <div
          className="md:hidden fixed left-0 right-0 flex justify-center px-4 z-50"
          style={{ bottom: `calc(var(--bottomnav-height) + 12px)` }}
        >
          {showUnretireConfirm ? (
            <div className="w-full max-w-sm flex flex-col gap-2">
              <p className="text-xs text-center text-text-muted">퇴근을 취소할까요?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { unretire(); setShowUnretireConfirm(false); }}
                  className="flex-1 py-3 rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                  style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
                  취소할게요
                </button>
                <button type="button" onClick={() => setShowUnretireConfirm(false)}
                  className="flex-1 py-3 rounded-full text-sm transition-all active:scale-[0.98] text-text-secondary"
                  style={{ background: 'rgba(0,0,0,0.08)' }}>
                  그냥 퇴근!
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowUnretireConfirm(true)}
              className="w-full max-w-sm py-3.5 rounded-full font-bold text-base transition-all duration-200 active:scale-[0.98] focus:outline-none"
              style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--color-text-muted)' }}>
              😢 퇴근 번복하기
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export default App;