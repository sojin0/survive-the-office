import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { fetchReactionsForUser } from '../utils/reactions';
import { supabase } from '../lib/supabase';

function useMyReactionEntries(userName: string, team: string) {
  const [entries, setEntries] = useState<{ emoji: string; count: number }[]>([]);

  useEffect(() => {
    if (!userName || !team) return;

    const load = () =>
      fetchReactionsForUser(userName, team).then((reactions) => {
        setEntries(
          Object.entries(reactions)
            .filter(([, count]) => count > 0)
            .map(([emoji, count]) => ({ emoji, count }))
        );
      });

    load();

    const channel = supabase
      .channel('timeline_reactions')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'reactions',
        filter: `to_user=eq.${userName}`,
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userName, team]);

  return entries;
}

function getRetireConfirmMessage(hp: number): { title: string; confirm: string; cancel: string } {
  if (hp >= 81) return { title: '오늘 컨디션 최고였어요! 🏆\n이대로 퇴근할까요?', confirm: '✅ 확인하기', cancel: '조금만 더 버텨볼게요' };
  if (hp >= 61) return { title: '순항 중인데 벌써 퇴근? 🚪\n오늘의 생존 등급을 확인할까요?', confirm: '✅ 확인하기', cancel: '조금만 더 버텨볼게요' };
  if (hp >= 41) return { title: '오늘 하루 수고했어요 ☁️\n이제 퇴근할 시간인가요?', confirm: '✅ 확인하기', cancel: '조금만 더 버텨볼게요' };
  if (hp >= 21) return { title: '많이 힘드셨죠... 🌧️\n오늘은 여기까지 할까요?', confirm: '✅ 확인하기', cancel: '조금만 더 버텨볼게요' };
  return { title: '한계까지 왔어요 ⛈️\n지금 당장 퇴근하세요!', confirm: '🚪 지금 바로 퇴근!', cancel: '아직 버틸게요...' };
}

export function RetireConfirmModal({ hp, onConfirm, onCancel }: { hp: number; onConfirm: () => void; onCancel: () => void }) {
  const msg = getRetireConfirmMessage(hp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="mx-3 mb-3 p-4 rounded-md flex flex-col gap-3"
      style={{ background: 'var(--color-surface-strong)', boxShadow: 'var(--shadow-elevated)' }}
    >
      <p className="text-sm font-medium text-center whitespace-pre-line text-text-primary">{msg.title}</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onConfirm}
          className="w-full py-2.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] focus:outline-none"
          style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
          {msg.confirm}
        </button>
        <button type="button" onClick={onCancel}
          className="w-full py-2.5 rounded-full text-sm font-medium transition-all active:scale-[0.98] focus:outline-none text-text-secondary"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          {msg.cancel}
        </button>
      </div>
    </motion.div>
  );
}

export function TimelinePanel() {
  const eventLog = useAppStore((s) => s.eventLog);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const resetDay = useAppStore((s) => s.resetDay);
  const retire = useAppStore((s) => s.retire);
  const unretire = useAppStore((s) => s.unretire);
  const isRetired = useAppStore((s) => s.isRetired);
  const isViewingDashboard = useAppStore((s) => s.isViewingDashboard);
  const weatherState = useAppStore((s) => s.weatherState);
  const hp = useAppStore((s) => s.hp);
  const userName = useAuthStore((s) => s.userName);
  const team = useAuthStore((s) => s.team);

  const isDark = weatherState === 'stormy' || weatherState === 'dead';
  const isReadOnly = isRetired || isViewingDashboard;

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showUnretireConfirm, setShowUnretireConfirm] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);

  const reactionEntries = useMyReactionEntries(userName, team);
  const eventListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleClearAll = () => {
    if (confirmClear) { resetDay(); setConfirmClear(false); }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  };

  const hasContent = eventLog.length > 0 || reactionEntries.length > 0;
  const dotPositive = isDark ? '#FFFFFF' : '#1A1A1A';
  const dotNegative = isDark ? 'rgba(255,255,255,0.3)' : '#BBBBBB';
  const textPositive = isDark ? '#FFFFFF' : '#1A1A1A';
  const textNegative = isDark ? 'rgba(255,255,255,0.45)' : '#999999';

  return (
    <aside
      className="w-full md:shrink-0 glass-card flex flex-col"
      style={isMobile ? {} : {
        position: 'sticky',
        top: 'var(--header-height)',
        height: 'calc(100vh - var(--header-height) - var(--bottomnav-height) - 32px)',
        overflow: 'hidden',
      }}
      data-testid="timeline"
      aria-label="오늘의 기록 타임라인"
    >
      <div className="flex items-center justify-between shrink-0 px-4"
        style={{ borderBottom: '1px solid var(--color-border)', paddingTop: 14, paddingBottom: 14 }}>
        <h3 className="text-sm font-semibold text-text-primary">오늘의 기록</h3>
        {isRetired && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
            🌙 오늘 퇴근 완료
          </span>
        )}
        <AnimatePresence>
          {eventLog.length > 0 && !isReadOnly && !isRetired && (
            <motion.button type="button" onClick={handleClearAll}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="text-xs px-2.5 py-1 rounded-full transition-all duration-150 focus:outline-none"
              style={{ background: confirmClear ? '#E53935' : 'rgba(0,0,0,0.07)', color: confirmClear ? '#fff' : 'var(--color-text-muted)' }}
              aria-label="오늘 기록 전체 삭제">
              {confirmClear ? '정말 삭제할까요?' : '🗑️ 전체 삭제'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className={isMobile ? 'overflow-visible' : 'overflow-y-auto flex-1 min-h-0'}>
        {!hasContent ? (
          <div className="flex items-center justify-center px-4 py-8">
            <p className="text-sm text-text-muted">아직 기록이 없어요 👀</p>
          </div>
        ) : (
          <>
            <div ref={eventListRef} className="relative" style={{ padding: '8px 8px 0 0' }}>
              {eventLog.length > 0 && (
                <div className="pointer-events-none" style={{ position: 'absolute', top: 0, bottom: 0, left: 52, width: 2, background: 'var(--color-timeline-line)' }} aria-hidden />
              )}
              <AnimatePresence initial={false}>
                {eventLog.map((log) => (
                  <motion.div key={log.id}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.18 }}
                    className="relative flex items-center"
                    style={{ paddingTop: 8, paddingBottom: 8 }}>
                    <span className="shrink-0 tabular-nums text-right" style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 44, minWidth: 44 }}>
                      {log.timestamp}
                    </span>
                    <div style={{ width: 4, minWidth: 4, flexShrink: 0 }} />
                    <span className="absolute rounded-full" style={{ width: 10, height: 10, left: 48, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: log.hpDelta >= 0 ? dotPositive : dotNegative, boxShadow: '0 0 0 2px var(--color-surface)' }} aria-hidden />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1" style={{ paddingLeft: 16 }}>
                      <span className="text-sm shrink-0" aria-hidden style={{ opacity: log.hpDelta >= 0 ? 1 : isDark ? 0.5 : 0.7 }}>{log.emoji}</span>
                      <span className="text-xs truncate flex-1" style={{ color: log.hpDelta >= 0 ? textPositive : textNegative }}>{log.name}</span>
                      <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: log.hpDelta >= 0 ? textPositive : textNegative }}>
                        {log.hpDelta >= 0 ? '+' : ''}{log.hpDelta}
                      </span>
                    </div>
                    {!isReadOnly && !isRetired && (
                      <button type="button" onClick={() => removeEvent(log.id)}
                        className="shrink-0 w-5 h-5 ml-1 flex items-center justify-center rounded-full opacity-30 hover:opacity-100 transition-opacity duration-150 focus:outline-none"
                        style={{ background: 'rgba(0,0,0,0.10)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                        aria-label={`${log.name} 삭제`}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {reactionEntries.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                style={{ marginTop: 8, paddingTop: 12, paddingLeft: 8, paddingBottom: 8, borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs font-medium mb-2 text-text-muted" style={{ paddingLeft: 4 }}>팀원 응원 도착 🎉</p>
                <div className="flex flex-wrap gap-2 px-1">
                  {reactionEntries.map(({ emoji, count }) => (
                    <div key={emoji} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-text-secondary" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <span>{emoji}</span>
                      <span className="text-xs font-medium tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <div className="hidden md:block shrink-0">
        <AnimatePresence>
          {showRetireConfirm && (
            <RetireConfirmModal hp={hp}
              onConfirm={() => { retire(); setShowRetireConfirm(false); }}
              onCancel={() => setShowRetireConfirm(false)} />
          )}
        </AnimatePresence>
        {!showRetireConfirm && (
          <div className="px-3 pt-3 pb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            {isRetired ? (
              showUnretireConfirm ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-center text-text-muted">퇴근을 취소할까요?</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { unretire(); setShowUnretireConfirm(false); }}
                      className="flex-1 py-2 rounded-full text-sm font-bold transition-all active:scale-[0.98]"
                      style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
                      취소할게요
                    </button>
                    <button type="button" onClick={() => setShowUnretireConfirm(false)}
                      className="flex-1 py-2 rounded-full text-sm transition-all active:scale-[0.98] text-text-secondary"
                      style={{ background: 'rgba(0,0,0,0.06)' }}>
                      그냥 퇴근!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => setShowUnretireConfirm(true)}
                    className="w-full py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-[0.98] focus:outline-none"
                    style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--color-text-muted)' }}
                    data-testid="btn-checkout">
                    😢 퇴근 번복하기
                  </button>
                </div>
              )
            ) : (
              <button type="button" onClick={() => setShowRetireConfirm(true)}
                className="w-full py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-[0.98] focus:outline-none"
                style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                data-testid="btn-checkout">
                🚪 퇴근하기
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}