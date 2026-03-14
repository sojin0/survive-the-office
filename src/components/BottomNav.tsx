import type { TabId } from '../types';

type BottomNavProps = {
  activeTab: TabId;
  onTab: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: '대시보드', icon: '📊' },
  { id: 'team', label: '팀보드', icon: '👥' },
  { id: 'history', label: '히스토리', icon: '📅' },
];

export function BottomNav({ activeTab, onTab }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        height: 56,
      }}
      role="tablist"
      aria-label="메인 메뉴"
    >
      <div className="grid grid-cols-3 h-full max-w-xl mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onTab(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 focus:outline-none transition-all duration-150"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span className="text-lg" aria-hidden>{tab.icon}</span>
              <span style={{ fontSize: 10 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
