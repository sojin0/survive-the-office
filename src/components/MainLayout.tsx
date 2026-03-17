import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Dashboard } from './Dashboard';
import { TeamBoard } from './TeamBoard';
import { HistoryCalendar } from './HistoryCalendar';
import type { TabId } from '../types';
import { useAppStore } from '../store/useAppStore';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const weatherState = useAppStore((s) => s.weatherState);

  return (
    <>
      <div
        className={`weather-${weatherState}`}
        style={{
          height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))',
          transition: 'background var(--transition-bg)',
        }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'team' && <TeamBoard />}
        {activeTab === 'history' && <HistoryCalendar />}
      </div>
      <BottomNav activeTab={activeTab} onTab={setActiveTab} />
    </>
  );
}