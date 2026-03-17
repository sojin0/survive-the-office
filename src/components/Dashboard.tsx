import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { WeatherCard } from './WeatherCard';
import { HPGauge } from './HPGauge';
import { EventPanel } from './EventPanel';
import { TimelinePanel } from './TimelinePanel';
import { fetchReactionsForUser } from '../utils/reactions';
import { supabase } from '../lib/supabase';

function getDateLabel(): string {
  const d = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

function useMyReactions(userName: string, team: string) {
  const [reactions, setReactions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userName || !team) return;

    fetchReactionsForUser(userName, team).then(setReactions);

    // 실시간 구독
    const channel = supabase
      .channel('my_reactions')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'reactions',
        filter: `to_user=eq.${userName}`,
      }, () => fetchReactionsForUser(userName, team).then(setReactions))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userName, team]);

  return reactions;
}

function ReactionBadge({ userName, team }: { userName: string; team: string }) {
  const reactions = useMyReactions(userName, team);
  const entries = Object.entries(reactions).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {entries.map(([emoji, count]) => (
        <span key={emoji} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-text-secondary" style={{ background: 'rgba(0,0,0,0.07)' }}>
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
  const team = useAuthStore((s) => s.team);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(oneLiner);
  const reactions = useMyReactions(userName, team);
  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  const handleBlur = () => {
    setIsEditing(false);
    setOneLiner(draft.trim() || oneLiner);
  };

  return (
    <div className="glass-card flex flex-col gap-2 px-md py-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm shrink-0 text-text-muted">{userName}의 한마디</span>
        {isEditing ? (
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            maxLength={40} autoFocus
            className="flex-1 text-sm focus:outline-none bg-transparent text-text-primary"
            style={{ borderBottom: '1.5px solid rgba(0,0,0,0.2)' }} />
        ) : (
          <button type="button" onClick={() => { setDraft(oneLiner); setIsEditing(true); }}
            className="flex-1 text-left text-sm transition-all duration-150 hover:opacity-70 focus:outline-none text-text-primary" title="클릭해서 편집">
            {oneLiner}
          </button>
        )}
        <span className="text-xs shrink-0 text-text-muted">✏️</span>
      </div>
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-xs shrink-0 text-text-muted">팀원 응원</span>
          <ReactionBadge userName={userName} team={team} />
        </div>
      )}
    </div>
  );
}

// ── 디데이 카운터 ──────────────────────────────────────
const DEFAULT_DDAYS = [
  { id: 'kimes', label: '😎 KIMES 2026 오픈', date: '2026-03-19' },
  { id: 'vacation', label: '🏖️ 전사 휴가', date: '2026-05-04' },
];

type DDay = { id: string; label: string; date: string };

function calcDDay(dateStr: string): string {
  if (!dateStr) return '날짜 미설정';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'D-Day!';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function DDayWidget() {
  const STORAGE_KEY = 'ddays_v1';
  const [ddays, setDdays] = useState<DDay[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as DDay[]; }
    catch { return DEFAULT_DDAYS; }
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const save = (updated: DDay[]) => {
    setDdays(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateDate = (id: string, date: string) =>
    save(ddays.map((d) => d.id === id ? { ...d, date } : d));

  const updateLabel = (id: string, label: string) =>
    save(ddays.map((d) => d.id === id ? { ...d, label } : d));

  const addDDay = () => {
    if (!newLabel.trim()) return;
    save([...ddays, { id: `custom-${Date.now()}`, label: newLabel.trim(), date: '' }]);
    setNewLabel('');
    setShowAddForm(false);
  };

  const removeDDay = (id: string) => save(ddays.filter((d) => d.id !== id));

  return (
    <div className="glass-card p-4 flex flex-col gap-3 md:h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">⚔️ 카운트다운</span>
        <button type="button" onClick={() => setShowAddForm((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-full transition-all text-text-muted"
          style={{ background: 'rgba(0,0,0,0.07)' }}>
          {showAddForm ? '취소' : '+ 추가'}
        </button>
      </div>

      {showAddForm && (
        <div className="flex gap-2">
          <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDDay()}
            placeholder="예) 🎯 스프린트 마감" autoFocus
            className="flex-1 px-3 py-1.5 rounded-md text-sm focus:outline-none"
            style={{ background: 'var(--color-surface-strong)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--color-text-primary)' }} />
          <button type="button" onClick={addDDay}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
            추가
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ddays.map((d) => {
          const dtext = calcDDay(d.date);
          const isPast = d.date && dtext.startsWith('D+');
          return (
            <div key={d.id} className="flex flex-col gap-1.5 p-3 rounded-[var(--radius-md)] relative group"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <button type="button" onClick={() => removeDDay(d.id)}
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full items-center justify-center text-xs opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity hidden group-hover:flex"
                style={{ background: 'rgba(0,0,0,0.12)', color: 'var(--color-text-muted)' }}>×</button>
              {editingId === d.id ? (
                <input type="text" defaultValue={d.label} autoFocus
                  onBlur={(e) => { updateLabel(d.id, e.target.value); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateLabel(d.id, e.currentTarget.value); setEditingId(null); } }}
                  className="text-xs font-medium focus:outline-none bg-transparent text-text-primary"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.2)' }} />
              ) : (
                <button type="button" onClick={() => setEditingId(d.id)}
                  className="text-xs font-medium text-left truncate text-text-secondary hover:opacity-70">
                  {d.label}
                </button>
              )}
              <span className="text-lg font-bold tabular-nums" style={{ color: isPast ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                {dtext}
              </span>
              <input type="date" value={d.date} onChange={(e) => updateDate(d.id, e.target.value)}
                className="text-xs focus:outline-none bg-transparent cursor-pointer text-text-muted"
                style={{ colorScheme: 'light' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 체크리스트 ──────────────────────────────────────────
type CheckItem = { id: string; text: string; done: boolean };
const CHECKLIST_KEY = 'checklist_v1';

function loadChecklist(): CheckItem[] {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) ?? '') as CheckItem[]; }
  catch { return []; }
}

function Checklist() {
  const [items, setItems] = useState<CheckItem[]>(loadChecklist);
  const [input, setInput] = useState('');
  const addEvent = useAppStore((s) => s.addEvent);
  const isRetired = useAppStore((s) => s.isRetired);

  const save = (updated: CheckItem[]) => {
    setItems(updated);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
  };

  const addItem = () => {
    if (!input.trim()) return;
    save([...items, { id: `c-${Date.now()}`, text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const nowDone = !item.done;
    save(items.map((i) => i.id === id ? { ...i, done: nowDone } : i));
    if (nowDone && !isRetired) {
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      addEvent({ eventId: `mission-${id}`, name: `✅ ${item.text}`, emoji: '🎯', hpDelta: 3, timestamp });
    }
  };

  const remove = (id: string) => save(items.filter((i) => i.id !== id));

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="glass-card p-4 flex flex-col gap-3 md:h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">🎯 오늘의 미션</span>
        {items.length > 0 && (
          <span className="text-xs text-text-muted">{doneCount}/{items.length}</span>
        )}
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="할 일 추가..."
          className="flex-1 px-3 py-1.5 rounded-md text-sm focus:outline-none"
          style={{ background: 'var(--color-surface-strong)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--color-text-primary)' }} />
        <button type="button" onClick={addItem}
          className="px-3 py-1.5 rounded-md text-sm font-medium"
          style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)', opacity: input.trim() ? 1 : 0.4 }}>
          추가
        </button>
      </div>

      {items.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-4">
          <p className="text-sm text-text-muted text-center">오늘 할일을 등록해보세요 🗒️</p>
        </div>
      )}
      {items.length > 0 && (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 group px-1 py-0.5 rounded-md hover:bg-black/[0.03]">
              <button type="button" onClick={() => toggle(item.id)}
                className="w-4 h-4 shrink-0 rounded flex items-center justify-center transition-all"
                style={{ border: item.done ? 'none' : '1.5px solid rgba(0,0,0,0.25)', background: item.done ? 'var(--color-btn-primary-bg)' : 'transparent' }}>
                {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <span className="flex-1 text-sm text-text-primary" style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.45 : 1 }}>
                {item.text}
              </span>
              <button type="button" onClick={() => remove(item.id)}
                className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-text-muted text-xs w-4 h-4 flex items-center justify-center">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────
export function Dashboard() {
  return (
    <div
      className="flex flex-col md:flex-row md:gap-4 px-4 py-4 gap-4"
      style={{ height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))', overflow: 'hidden' }}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto overflow-x-visible md:pb-4 pb-[72px] px-4 -mx-4 md:h-full" style={{ scrollbarWidth: 'none' }}>
        <p className="font-semibold shrink-0 text-sm text-text-primary">{getDateLabel()}</p>
        <div className="grid grid-cols-2 gap-4 items-stretch shrink-0">
          <WeatherCard />
          <HPGauge />
        </div>
        <div className="shrink-0"><OneLinerInput /></div>
        <div className="shrink-0"><EventPanel /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:flex-1 md:min-h-0 shrink-0 md:shrink">
          <div className="min-w-0 md:overflow-hidden"><DDayWidget /></div>
          <div className="min-w-0 md:overflow-hidden"><Checklist /></div>
        </div>
        <div className="md:hidden shrink-0"><TimelinePanel /></div>

      </div>

      <div className="hidden md:block md:w-[360px] md:min-w-[240px] md:max-w-[700px] md:shrink-0">
        <TimelinePanel />
      </div>
    </div>
  );
}