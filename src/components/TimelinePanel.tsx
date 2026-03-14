import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function TimelinePanel() {
  const eventLog = useAppStore((s) => s.eventLog);
  const removeEvent = useAppStore((s) => s.removeEvent);
  const retire = useAppStore((s) => s.retire);
  const isRetired = useAppStore((s) => s.isRetired);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
      <h3
        className="text-sm font-semibold px-4 shrink-0"
        style={{
          color: 'var(--color-text-primary)',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 14,
          paddingBottom: 14,
        }}
      >
        오늘의 기록
      </h3>

      {/* 스크롤 영역 — 데스크탑: flex-1+min-h-0으로 고정 높이 내 스크롤, 모바일: height auto */}
      <div className={`overflow-y-auto relative${isMobile ? '' : ' flex-1 min-h-0'}`} style={isMobile ? { paddingBottom: 80 } : undefined}>
        {eventLog.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              아직 기록이 없어요 👀
            </p>
          </div>
        ) : (
          <div className="relative" style={{ padding: '8px 8px 8px 0' }}>

            {/*
              세로 라인: 이 컨테이너 기준 absolute (top:0 ~ bottom:0)
              left padding = 0 이므로 motion.div와 동일한 left 기준
              dot.left(48) + dot반경(5) = 53 = line.left(52) + line반경(1) → 중앙 일치
            */}
            <div
              className="pointer-events-none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 52,  /* dot 중앙(53) - line 반폭(1) = 52 */
                width: 2,
                background: 'var(--color-timeline-line)',
              }}
              aria-hidden
            />

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
                  {/* 타임스탬프 — 44px 고정 */}
                  <span
                    className="shrink-0 tabular-nums text-right"
                    style={{
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      width: 44,
                      minWidth: 44,
                    }}
                  >
                    {log.timestamp}
                  </span>

                  {/* gap 4px */}
                  <div style={{ width: 4, minWidth: 4, flexShrink: 0 }} />

                  {/* dot — left:48px, 중앙:48+5=53 ≈ line(52+1=53) 일치 */}
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      left: 48,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: log.hpDelta >= 0 ? '#1A1A1A' : '#BBBBBB',
                      boxShadow: '0 0 0 2px var(--color-surface)',
                    }}
                    aria-hidden
                  />

                  {/* 콘텐츠 — dot 오른쪽 */}
                  <div
                    className="flex items-center gap-1.5 min-w-0 flex-1"
                    style={{ paddingLeft: 16 }}
                  >
                    <span className="text-sm shrink-0" aria-hidden>{log.emoji}</span>
                    <span
                      className="text-xs truncate flex-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {log.name}
                    </span>
                    <span
                      className="text-xs font-semibold tabular-nums shrink-0"
                      style={{ color: log.hpDelta >= 0 ? '#1A1A1A' : '#999999' }}
                    >
                      {log.hpDelta >= 0 ? '+' : ''}{log.hpDelta}
                    </span>
                  </div>

                  {/* X 버튼 */}
                  <button
                    type="button"
                    onClick={() => removeEvent(log.id)}
                    className="shrink-0 w-5 h-5 ml-1 flex items-center justify-center rounded-full opacity-30 hover:opacity-100 transition-opacity duration-150 focus:outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.10)',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
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
        )}
      </div>

      {/* 퇴근하기 버튼 — 패널 하단 고정 (모바일에서는 숨김, App.tsx에서 전역으로 표시) */}
      {!isRetired && (
        <div className="hidden md:block shrink-0 px-3 pt-3 pb-4"
          style={{ borderTop: '1px solid var(--color-border)' }}>
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