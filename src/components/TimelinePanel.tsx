import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { MOCK_TEAM_MEMBERS } from '../data/team';
import { getReactions } from '../utils/storage';

function useMyReactionEntries(userName: string) {
  const me = MOCK_TEAM_MEMBERS.find((m) => m.name === userName);
  if (!me) return [];
  const reactions = getReactions()[me.id] ?? {};
  return Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => ({ emoji, count }));
}

export function TimelinePanel() {
  const eventLog = useAppStore((s) => s.eventLog);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const resetDay = useAppStore((s) => s.resetDay);
  const retire = useAppStore((s) => s.retire);
  const isRetired = useAppStore((s) => s.isRetired);
  const weatherState = useAppStore((s) => s.weatherState);
  const userName = useAuthStore((s) => s.userName);

  const isDark = weatherState === 'stormy' || weatherState === 'dead';

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [confirmClear, setConfirmClear] = useState(false);

  const reactionEntries = useMyReactionEntries(userName);
  const eventListRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (eventListRef.current) {
      setLineHeight(eventListRef.current.offsetHeight);
    }
  }, [eventLog]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleClearAll = () => {
    if (confirmClear) {
      resetDay();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const hasContent = eventLog.length > 0 || reactionEntries.length > 0;

  // 날씨 테마별 dot/텍스트 색상
  const dotPositive = isDark ? '#FFFFFF' : '#1A1A1A';
  const dotNegative = isDark ? 'rgba(255,255,255,0.3)' : '#BBBBBB';
  const textPositive = isDark ? '#FFFFFF' : '#1A1A1A';
  const textNegative = isDark ? 'rgba(255,255,255,0.45)' : '#999999';

  return (
    <aside
      className="w-full md:w-[300px] md:shrink-0 order-last md:order-none glass-card flex flex-col"
      style={isMobile
        ? { overflow: 'hidden' }
        : { position: 'sticky', top: 'var(--header-height)', height: 'calc(100vh - var(--header-height) - var(--bottomnav-height) - 32px)', overflow: 'hidden' }
      }
      data-testid="timeline"
      aria-label="오늘의 기록 타임라인"
    >
      {/* 고정 헤더 */}
      <div
        className="flex items-center justify-between shrink-0 px-4"
        style={{ borderBottom: '1px solid var(--color-border)', paddingTop: 14, paddingBottom: 14 }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          오늘의 기록
        </h3>
        <AnimatePresence>
          {eventLog.length > 0 && !isRetired && (
            <motion.button
              type="button"
              onClick={handleClearAll}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="text-xs px-2.5 py-1 rounded-full transition-all duration-150 focus:outline-none"
              style={{
                background: confirmClear ? '#E53935' : 'rgba(0,0,0,0.07)',
                color: confirmClear ? '#fff' : 'var(--color-text-muted)',
              }}
              aria-label="오늘 기록 전체 삭제"
            >
              {confirmClear ? '정말 삭제할까요?' : '🗑️ 전체 삭제'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 스크롤 영역 */}
      <div
        className={`overflow-y-auto relative${isMobile ? '' : ' flex-1 min-h-0'}`}
        style={isMobile ? { paddingBottom: 80 } : undefined}
      >
        {!hasContent ? (
          <div className="flex items-center justify-center h-full px-4 py-8">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              아직 기록이 없어요 👀
            </p>
          </div>
        ) : (
          <div className="relative" style={{ padding: '8px 8px 8px 0' }}>

            {/* 세로 라인 */}
            {eventLog.length > 0 && (
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  top: 0,
                  height: lineHeight,
                  left: 52,
                  width: 2,
                  background: 'var(--color-timeline-line)',
                }}
                aria-hidden
              />
            )}

            {/* 이벤트 로그 */}
            <div ref={eventListRef}>
              <AnimatePresence initial={false}>
                {eventLog.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.18 }}
                    className="relative flex items-center"
                    style={{ paddingTop: 8, paddingBottom: 8 }}
                  >
                    <span
                      className="shrink-0 tabular-nums text-right"
                      style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 44, minWidth: 44 }}
                    >
                      {log.timestamp}
                    </span>
                    <div style={{ width: 4, minWidth: 4, flexShrink: 0 }} />
                    <span
                      className="absolute rounded-full"
                      style={{
                        width: 10, height: 10, left: 48,
                        top: '50%', transform: 'translateY(-50%)', zIndex: 2,
                        background: log.hpDelta >= 0 ? dotPositive : dotNegative,
                        boxShadow: '0 0 0 2px var(--color-surface)',
                      }}
                      aria-hidden
                    />
                    <div className="flex items-center gap-1.5 min-w-0 flex-1" style={{ paddingLeft: 16 }}>
                      <span
                        className="text-sm shrink-0"
                        aria-hidden
                        style={{ opacity: log.hpDelta >= 0 ? 1 : isDark ? 0.5 : 0.7 }}
                      >
                        {log.emoji}
                      </span>
                      <span
                        className="text-xs truncate flex-1"
                        style={{ color: log.hpDelta >= 0 ? textPositive : textNegative }}
                      >
                        {log.name}
                      </span>
                      <span
                        className="text-xs font-semibold tabular-nums shrink-0"
                        style={{ color: log.hpDelta >= 0 ? textPositive : textNegative }}
                      >
                        {log.hpDelta >= 0 ? '+' : ''}{log.hpDelta}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvent(log.id)}
                      className="shrink-0 w-5 h-5 ml-1 flex items-center justify-center rounded-full opacity-30 hover:opacity-100 transition-opacity duration-150 focus:outline-none"
                      style={{ background: 'rgba(0,0,0,0.10)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      aria-label={`${log.name} 삭제`}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 팀원 응원 섹션 */}
            {reactionEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginTop: eventLog.length > 0 ? 8 : 0,
                  paddingTop: eventLog.length > 0 ? 12 : 4,
                  paddingLeft: 8,
                  borderTop: eventLog.length > 0 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)', paddingLeft: 4 }}>
                  팀원 응원 도착 🎉
                </p>
                <div className="flex flex-wrap gap-2 px-1">
                  {reactionEntries.map(({ emoji, count }) => (
                    <div
                      key={emoji}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                      style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text-secondary)' }}
                    >
                      <span>{emoji}</span>
                      <span className="text-xs font-medium tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* 퇴근하기 버튼 */}
      {!isRetired && (
        <div
          className="hidden md:block shrink-0 px-3 pt-3 pb-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            type="button"
            onClick={retire}
            className="w-full py-3 rounded-[var(--radius-full)] font-bold text-sm transition-all duration-200 active:scale-[0.98] focus:outline-none"
            style={{
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            data-testid="btn-checkout"
          >
            🚪 퇴근하기
          </button>
        </div>
      )}
    </aside>
  );
}