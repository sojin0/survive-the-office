import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { WeatherCard } from './WeatherCard';
import { HPGauge } from './HPGauge';
import { EventPanel } from './EventPanel';
import { TimelinePanel } from './TimelinePanel';
import { MOCK_TEAM_MEMBERS } from '../data/team';
import { getReactions } from '../utils/storage';

function getDateLabel(): string {
  const d = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

function useMyReactions(userName: string) {
  const me = MOCK_TEAM_MEMBERS.find((m) => m.name === userName);
  if (!me) return {};
  return getReactions()[me.id] ?? {};
}

function ReactionBadge({ userName }: { userName: string }) {
  const reactions = useMyReactions(userName);
  const entries = Object.entries(reactions).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {entries.map(([emoji, count]) => (
        <span
          key={emoji}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-text-secondary)' }}
        >
          {emoji} {count}
        </span>
      ))}
    </div>
  );
}

function OneLinerInput() {
  const oneLiner = useAppStore((s) => s.oneLiner);
  const setOneLiner = useAppStore((s) => s.setOneLiner);
  const userName = useAuthStore((s) => s.userName);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(oneLiner);
  const reactions = useMyReactions(userName);
  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  const handleBlur = () => {
    setIsEditing(false);
    setOneLiner(draft.trim() || oneLiner);
  };

  return (
    <div className="glass-card flex flex-col gap-2" style={{ padding: '10px 16px' }}>
      <div className="flex items-center gap-3">
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
            style={{ color: 'var(--color-text-primary)', borderBottom: '1.5px solid rgba(0,0,0,0.2)' }}
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
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>팀원 응원</span>
          <ReactionBadge userName={userName} />
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  return (
    // 전체 컨테이너 — 뷰포트 높이 고정, 넘치면 숨김
    <div
      className="flex flex-col md:flex-row md:gap-4 px-4 py-4 gap-4"
      style={{
        height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))',
        overflow: 'hidden',
      }}
    >
      {/* 왼쪽 — 내부 스크롤 */}
      <div
        className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pb-[124px] md:pb-4 px-4 -mx-4"
        style={{ scrollbarWidth: 'none', paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* 날짜 */}
        <p className="font-semibold shrink-0" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
          {getDateLabel()}
        </p>

        {/* 날씨 + HP */}
        <div className="grid grid-cols-2 gap-4 items-stretch shrink-0">
          <WeatherCard />
          <HPGauge />
        </div>

        {/* 한마디 */}
        <div className="shrink-0">
          <OneLinerInput />
        </div>

        {/* 이벤트 패널 */}
        <div className="shrink-0">
          <EventPanel />
        </div>
      </div>

      {/* 오른쪽 타임라인 — 고정 */}
      <div className="hidden md:block md:w-[300px] md:shrink-0">
        <TimelinePanel />
      </div>

      {/* 모바일 타임라인 — 왼쪽 스크롤 영역 밖으로 */}
      <div className="md:hidden shrink-0">
        <TimelinePanel />
      </div>
    </div>
  );
}