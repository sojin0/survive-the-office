import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { LoginScreen } from './components/LoginScreen';
import { AppHeader } from './components/AppHeader';
import { MainLayout } from './components/MainLayout';
import { SurvivalResult } from './components/SurvivalResult';
import './styles/weather-bg.css';

const WEATHER_IDS = ['sunny', 'cloudy_sunny', 'cloudy', 'rainy', 'stormy', 'dead'] as const;

function App() {
  const userName = useAuthStore((s) => s.userName);
  const authHydrate = useAuthStore((s) => s.hydrate);
  const isRetired = useAppStore((s) => s.isRetired);
  const weatherState = useAppStore((s) => s.weatherState);
  const hydrate = useAppStore((s) => s.hydrate);
  const retire = useAppStore((s) => s.retire);

  useEffect(() => { authHydrate(); }, [authHydrate]);
  useEffect(() => { hydrate(); }, [hydrate]);

  const isLoggedIn = userName.length > 0;
  const isDarkWeather = weatherState === 'stormy' || weatherState === 'dead';

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
        {isRetired ? <SurvivalResult /> : <MainLayout />}
      </div>

      {/* 퇴근하기 버튼 — 모바일 전용 하단 고정 (데스크탑은 TimelinePanel 하단에 표시) */}
      {!isRetired && (
        <div className="md:hidden fixed left-0 right-0 flex justify-center px-4 z-50"
          style={{ bottom: 68 }}>
          <button
            type="button"
            onClick={retire}
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
        </div>
      )}
    </main>
  );
}

export default App;