import { useState } from 'react';
import { POSITIVE_EVENTS, NEGATIVE_EVENTS } from '../data/events';
import { EventButton } from './EventButton';
import { useAppStore } from '../store/useAppStore';
import type { EventItem } from '../types';

type Tab = 'positive' | 'negative';

// 커스텀 이벤트 추가 폼
function AddEventForm({
  tab,
  onAdd,
  onCancel,
}: {
  tab: Tab;
  onAdd: (e: EventItem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [delta, setDelta] = useState(tab === 'positive' ? 10 : -10);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || (tab === 'positive' ? '⭐' : '💢'),
      description: name.trim(),
      hpDelta: tab === 'positive' ? Math.abs(delta) : -Math.abs(delta),
      eventType: tab,
    });
    setName('');
    setEmoji('');
  };

  return (
    <div
      className="mt-2 p-3 rounded-[var(--radius-md)] flex flex-col gap-2"
      style={{ background: 'rgba(0,0,0,0.04)', border: '1px dashed rgba(0,0,0,0.15)' }}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="😀"
          maxLength={2}
          className="w-12 text-center rounded-[var(--radius-sm)] px-2 py-1.5 text-sm focus:outline-none"
          style={{
            background: 'var(--color-surface-strong)',
            border: '1px solid rgba(0,0,0,0.12)',
            color: 'var(--color-text-primary)',
          }}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이벤트 이름"
          className="flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm focus:outline-none"
          style={{
            background: 'var(--color-surface-strong)',
            border: '1px solid rgba(0,0,0,0.12)',
            color: 'var(--color-text-primary)',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <input
          type="number"
          value={Math.abs(delta)}
          onChange={(e) => setDelta(Number(e.target.value))}
          min={1}
          max={30}
          className="w-14 text-center rounded-[var(--radius-sm)] px-2 py-1.5 text-sm focus:outline-none"
          style={{
            background: 'var(--color-surface-strong)',
            border: '1px solid rgba(0,0,0,0.12)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all"
          style={{
            background: 'var(--color-btn-primary-bg)',
            color: 'var(--color-btn-primary-text)',
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          추가
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all"
          style={{
            background: 'rgba(0,0,0,0.06)',
            color: 'var(--color-text-secondary)',
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}

export function EventPanel() {
  const [tab, setTab] = useState<Tab>('positive');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customEvents, setCustomEvents] = useState<EventItem[]>([]);
  const isRetired = useAppStore((s) => s.isRetired);

  const baseEvents = tab === 'positive' ? POSITIVE_EVENTS : NEGATIVE_EVENTS;
  const custom = customEvents.filter((e) => e.eventType === tab);
  const events = [...baseEvents, ...custom];

  const handleAdd = (e: EventItem) => {
    setCustomEvents((prev) => [...prev, e]);
    setShowAddForm(false);
  };

  return (
    <section className="glass-card p-[var(--spacing-lg)]">

      {/* 탭 */}
      <div
        className="flex gap-1 p-1 mb-4 rounded-[var(--radius-md)]"
        style={{ background: 'rgba(0,0,0,0.08)' }}
      >
        {(['positive', 'negative'] as Tab[]).map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setShowAddForm(false); }}
              className="flex-1 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-200 focus:outline-none"
              style={{
                background: isActive ? 'var(--color-btn-primary-bg)' : 'transparent',
                color: isActive ? 'var(--color-btn-primary-text)' : 'var(--color-text-muted)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                transform: isActive ? 'scale(1)' : 'scale(0.97)',
              }}
              data-testid={`tab-${t}`}
              aria-pressed={isActive}
            >
              {t === 'positive' ? '✨ 긍정' : '💦 부정'}
            </button>
          );
        })}
      </div>

      {/* 이벤트 버튼 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {events.map((event) => (
          <EventButton key={event.id} event={event} />
        ))}

        {/* + 버튼 — 퇴근 후 숨김 */}
        {!showAddForm && !isRetired && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-[var(--radius-md)] min-h-[52px] flex items-center justify-center gap-1 text-sm font-medium transition-all duration-150 hover:scale-[1.02]"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: '1.5px dashed rgba(0,0,0,0.15)',
              color: 'var(--color-text-muted)',
            }}
            aria-label="이벤트 추가"
          >
            <span style={{ fontSize: 18 }}>+</span>
            <span className="text-xs">직접 추가</span>
          </button>
        )}
      </div>

      {/* 추가 폼 */}
      {showAddForm && (
        <AddEventForm
          tab={tab}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

    </section>
  );
}