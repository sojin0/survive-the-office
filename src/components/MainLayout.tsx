import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Dashboard } from './Dashboard';
import { TeamBoard } from './TeamBoard';
import { HistoryCalendar } from './HistoryCalendar';
import type { TabId } from '../types';
import { useAppStore } from '../store/useAppStore';
import type { WeatherState } from '../types';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [teamWeather, setTeamWeather] = useState<WeatherState>('sunny');
  const [historyWeather, setHistoryWeather] = useState<WeatherState>('sunny');

  const myWeather = useAppStore((s) => s.weatherState);

  const currentWeather =
    activeTab === 'dashboard' ? myWeather :
    activeTab === 'team' ? teamWeather :
    historyWeather;

  return (
    <>
      <div
        className={`weather-${currentWeather}`}
        style={{
          height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))',
          transition: 'background var(--transition-bg)',
          overflow: 'hidden',
        }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'team' && (
          <TeamBoard onWeatherChange={setTeamWeather} />
        )}
        {activeTab === 'history' && (
          <HistoryCalendar onWeatherChange={setHistoryWeather} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTab={setActiveTab} />
    </>
  );
}