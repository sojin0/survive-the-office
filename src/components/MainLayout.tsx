import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Dashboard } from './Dashboard';
import { TeamBoard } from './TeamBoard';
import { HistoryCalendar } from './HistoryCalendar';
import type { TabId } from '../types';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <>
      <div style={{ minHeight: 'calc(100vh - var(--header-height) - var(--bottomnav-height))' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'team' && <TeamBoard />}
        {activeTab === 'history' && <HistoryCalendar />}
      </div>
      <BottomNav activeTab={activeTab} onTab={setActiveTab} />
    </>
  );
}