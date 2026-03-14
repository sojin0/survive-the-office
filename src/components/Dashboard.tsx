import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { WeatherCard } from './WeatherCard';
import { HPGauge } from './HPGauge';
import { EventPanel } from './EventPanel';
import { TimelinePanel } from './TimelinePanel';

function getDateLabel(): string {
  const d = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

function OneLinerInput() {
  const oneLiner = useAppStore((s) => s.oneLiner);
  const setOneLiner = useAppStore((s) => s.setOneLiner);
  const userName = useAuthStore((s) => s.userName);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(oneLiner);

  const handleBlur = () => {
    setIsEditing(false);
    setOneLiner(draft.trim() || oneLiner);
  };

  return (
    <div
      className="glass-card flex items-center gap-3"
      style={{ padding: '10px 16px' }}
    >
      <span className="text-sm shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {userName}의 한마디
      </span>
      {isEditing ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          maxLength={40}
          autoFocus
          className="flex-1 text-sm focus:outline-none bg-transparent"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1.5px solid rgba(0,0,0,0.2)',
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => { setDraft(oneLiner); setIsEditing(true); }}
          className="flex-1 text-left text-sm transition-all duration-150 hover:opacity-70 focus:outline-none"
          style={{ color: 'var(--color-text-primary)' }}
          title="클릭해서 편집"
        >
          {oneLiner}
        </button>
      )}
      <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>✏️</span>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row md:gap-4 p-4 pb-4 gap-4">

      {/* 왼쪽 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* 날짜 */}
        <p className="font-semibold" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
          {getDateLabel()}
        </p>

        {/* 날씨 + HP 2컬럼 */}
        <div className="grid grid-cols-2 gap-4 items-stretch">
          <WeatherCard />
          <HPGauge />
        </div>

        {/* 오늘의 한마디 */}
        <OneLinerInput />

        {/* 이벤트 패널 */}
        <EventPanel />

      </div>

      {/* 오른쪽 타임라인 패널 */}
      <TimelinePanel />
    </div>
  );
}