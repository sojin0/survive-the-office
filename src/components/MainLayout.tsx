import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Dashboard } from './Dashboard';
import { TeamBoard } from './TeamBoard';
import { HistoryCalendar } from './HistoryCalendar';
import type { TabId } from '../types';
import { useAppStore } from '../store/useAppStore';
import type { WeatherState } from '../types';

type MainLayoutProps = {
  onWeatherChange: (w: WeatherState) => void;
};

export function MainLayout({ onWeatherChange }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [teamWeather, setTeamWeather] = useState<WeatherState>('sunny');
  const [historyWeather, setHistoryWeather] = useState<WeatherState>('sunny');
  const myWeather = useAppStore((s) => s.weatherState);

  const currentWeather =
    activeTab === 'dashboard' ? myWeather :
    activeTab === 'team' ? teamWeather :
    historyWeather;

  // 탭이 바뀌거나 날씨가 바뀔 때마다 부모(App)에 알림
  useState(() => {
    onWeatherChange(currentWeather);
  });

  // currentWeather가 바뀔 때마다 App에 전달
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const next =
      tab === 'dashboard' ? myWeather :
      tab === 'team' ? teamWeather :
      historyWeather;
    onWeatherChange(next);
  };

  return (
    <>
      <div
        className={`weather-${currentWeather}`}
        style={{
          height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))',
          transition: 'background var(--transition-bg)',
          overflowY: activeTab === 'team' ? 'auto' : 'hidden',
        }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'team' && (
          <TeamBoard onWeatherChange={(w) => { setTeamWeather(w); if (activeTab === 'team') onWeatherChange(w); }} />
        )}
        {activeTab === 'history' && (
          <HistoryCalendar onWeatherChange={(w) => { setHistoryWeather(w); if (activeTab === 'history') onWeatherChange(w); }} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTab={handleTabChange} />
    </>
  );
}