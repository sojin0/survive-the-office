import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getGradeMeta } from '../utils/hp';

function getTop3Events(
  eventLog: { name: string; emoji: string; hpDelta: number }[]
) {
  return [...eventLog]
    .sort((a, b) => Math.abs(b.hpDelta) - Math.abs(a.hpDelta))
    .slice(0, 3);
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

const GRADE_STYLES: Record<string, {
  bg: string; glow: string; textColor: string; particles: boolean; shake: boolean;
}> = {
  S: { bg: 'linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%)', glow: '#FFD700', textColor: '#B8860B', particles: true, shake: false },
  A: { bg: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)', glow: '#42A5F5', textColor: '#1565C0', particles: true, shake: false },
  B: { bg: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)', glow: '#66BB6A', textColor: '#2E7D32', particles: false, shake: false },
  C: { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)', glow: '#FFA726', textColor: '#E65100', particles: false, shake: false },
  D: { bg: 'linear-gradient(135deg, #EFEBE9 0%, #BCAAA4 100%)', glow: '#8D6E63', textColor: '#4E342E', particles: false, shake: false },
  F: { bg: 'linear-gradient(135deg, #ECEFF1 0%, #90A4AE 100%)', glow: '#78909C', textColor: '#37474F', particles: false, shake: true },
};

function Particles({ color }: { color: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    size: 4 + Math.random() * 6,
    dur: 1.2 + Math.random() * 0.8,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: 0, width: p.size, height: p.size, background: color, opacity: 0.8 }}
          animate={{ y: [-10, -180 - Math.random() * 100], opacity: [0.8, 0], scale: [1, 0.4] }}
          transition={{ delay: p.delay, duration: p.dur, repeat: Infinity, repeatDelay: Math.random() * 1.5 }}
        />
      ))}
    </div>
  );
}

export function SurvivalResult() {
  const hp = useAppStore((s) => s.hp);
  const minHp = useAppStore((s) => s.minHp);
  const eventLog = useAppStore((s) => s.eventLog);
  const survivalGrade = useAppStore((s) => s.survivalGrade);
  const viewDashboard = useAppStore((s) => s.viewDashboard);
  const [showToast, setShowToast] = useState(false);

  const handleViewDashboard = () => {
    setShowToast(true);
    setTimeout(() => viewDashboard(), 2000);
  };

  const countedHp = useCountUp(hp);
  const countedMin = useCountUp(minHp, 900);

  if (!survivalGrade) return null;

  const meta = getGradeMeta(survivalGrade);
  const top3 = getTop3Events(eventLog);
  const gradeStyle = GRADE_STYLES[survivalGrade] ?? GRADE_STYLES['C'];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col p-4 pb-8 overflow-y-auto"
      style={{ height: 'calc(100vh - var(--header-height) - var(--bottomnav-height))' }}
      data-testid="survival-result"
    >
      {/* 등급 카드 */}
      <div
        className="relative rounded-lg p-8 text-center mb-6 overflow-hidden"
        style={{ background: gradeStyle.bg }}
      >
        {gradeStyle.particles && <Particles color={gradeStyle.glow} />}

        <motion.p
          className="relative text-7xl font-black mb-2 tabular-nums"
          style={{ color: gradeStyle.textColor, textShadow: `0 0 40px ${gradeStyle.glow}88` }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={gradeStyle.shake
            ? { scale: [0.3, 1.1, 0.95, 1], opacity: 1, x: [0, -6, 6, -4, 4, 0] }
            : { scale: [0.3, 1.2, 0.95, 1], opacity: 1 }
          }
          transition={{ duration: 0.7, ease: 'easeOut' }}
          data-testid="survival-grade"
        >
          {survivalGrade}
        </motion.p>

        {gradeStyle.particles && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ border: `2px solid ${gradeStyle.glow}`, opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.95, 1.02, 1.05] }}
            transition={{ duration: 1.2, repeat: 3 }}
          />
        )}

        <motion.p className="text-3xl mb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} aria-hidden>
          {meta.emoji}
        </motion.p>
        <motion.h2
          className="text-xl font-bold mb-2"
          style={{ color: gradeStyle.textColor }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          {meta.title}
        </motion.h2>
        <motion.p
          className="text-sm opacity-80"
          style={{ color: gradeStyle.textColor }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.75 }}
        >
          {meta.comment}
        </motion.p>
      </div>

      {/* HP 요약 */}
      <motion.div
        className="rounded-lg p-lg bg-white/90 shadow-card mb-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-medium mb-3 text-text-secondary">HP 요약</h3>
        <div className="flex items-center justify-between gap-2 text-sm mb-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] text-text-muted">시작</span>
            <span className="text-2xl font-bold tabular-nums text-text-primary">80</span>
          </div>
          <div className="flex-1 mx-2 h-px bg-[var(--color-border)]" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] text-text-muted">최저</span>
            <span className="text-2xl font-bold tabular-nums text-text-muted">{countedMin}</span>
          </div>
          <div className="flex-1 mx-2 h-px bg-[var(--color-border)]" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] text-text-muted">최종</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: gradeStyle.textColor }}>{countedHp}</span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-hp-bg">
          <motion.div
            className="h-full rounded-full"
            style={{ background: gradeStyle.glow }}
            initial={{ width: 0 }}
            animate={{ width: `${hp}%` }}
            transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* TOP 3 */}
      {top3.length > 0 && (
        <motion.div
          className="rounded-lg p-lg bg-white/90 shadow-card mb-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        >
          <h3 className="text-sm font-medium mb-3 text-text-secondary">오늘의 TOP 3 이벤트</h3>
          <ul className="space-y-2">
            {top3.map((event, i) => (
              <motion.li
                key={`${event.name}-${i}`}
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.1 }}
                data-testid="top3-event"
              >
                <span className="text-[12px] w-5 text-text-muted">{i + 1}.</span>
                <span aria-hidden>{event.emoji}</span>
                <span className="flex-1 text-text-primary">{event.name}</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: event.hpDelta >= 0 ? gradeStyle.textColor : 'var(--color-text-muted)' }}
                >
                  {event.hpDelta >= 0 ? '+' : ''}{event.hpDelta}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-4 right-4 z-50 mx-auto max-w-sm py-3 px-4 rounded-md text-center text-sm font-medium shadow-elevated text-text-primary"
            style={{ background: 'var(--color-surface-strong)' }}
          >
            내일 출근해서 만나요! 🌅
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleViewDashboard}
        className="w-full py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-text-primary)] mt-auto"
        style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        대시보드 보기
      </motion.button>
    </motion.section>
  );
}