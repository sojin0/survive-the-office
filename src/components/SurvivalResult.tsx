import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getGradeMeta } from '../utils/hp';

function getTop3Events(
  eventLog: { name: string; emoji: string; hpDelta: number }[]
) {
  return [...eventLog]
    .sort((a, b) => Math.abs(b.hpDelta) - Math.abs(a.hpDelta))
    .slice(0, 3);
}

export function SurvivalResult() {
  const hp = useAppStore((s) => s.hp);
  const minHp = useAppStore((s) => s.minHp);
  const eventLog = useAppStore((s) => s.eventLog);
  const survivalGrade = useAppStore((s) => s.survivalGrade);
  const resetDay = useAppStore((s) => s.resetDay);

  if (!survivalGrade) return null;

  const meta = getGradeMeta(survivalGrade);
  const top3 = getTop3Events(eventLog);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col p-4 pb-8"
      data-testid="survival-result"
    >
      <div className="rounded-[var(--radius-lg)] p-[var(--spacing-xl)] bg-white shadow-elevated text-center mb-6">
        <p
          className="text-5xl font-bold text-[var(--color-text-primary)] mb-1"
          data-testid="survival-grade"
        >
          {survivalGrade}
        </p>
        <p className="text-2xl mb-2" aria-hidden>
          {meta.emoji}
        </p>
        <h2 className="text-[var(--font-size-title)] font-bold text-[var(--color-text-primary)] mb-2">
          {meta.title}
        </h2>
        <p className="text-[var(--color-text-secondary)]">{meta.comment}</p>
      </div>

      <div className="rounded-[var(--radius-lg)] p-[var(--spacing-lg)] bg-white/90 shadow-card mb-4">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
          HP 요약
        </h3>
        <div className="flex items-center justify-between gap-2 text-sm mb-2">
          <span>시작 100</span>
          <span className="text-[var(--color-negative)]">최저 {minHp}</span>
          <span className="font-bold text-[var(--color-text-primary)]">
            최종 {hp}
          </span>
        </div>
        <div className="h-2 rounded-[var(--radius-full)] bg-[var(--color-cloudy-bg)] overflow-hidden">
          <motion.div
            className="h-full rounded-[var(--radius-full)]"
            initial={false}
            animate={{
              width: `${hp}%`,
              backgroundColor:
                hp >= 61
                  ? 'var(--color-hp-high)'
                  : hp >= 21
                    ? 'var(--color-hp-mid)'
                    : 'var(--color-hp-low)',
            }}
            transition={{ type: 'ease-out', duration: 0.3 }}
          />
        </div>
      </div>

      {top3.length > 0 && (
        <div className="rounded-[var(--radius-lg)] p-[var(--spacing-lg)] bg-white/90 shadow-card mb-6">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            오늘의 TOP 3 이벤트
          </h3>
          <ul className="space-y-2">
            {top3.map((event, i) => (
              <li
                key={`${event.name}-${i}`}
                className="flex items-center gap-2 text-sm"
                data-testid="top3-event"
              >
                <span className="text-[var(--color-text-disabled)] w-5">
                  {i + 1}.
                </span>
                <span aria-hidden>{event.emoji}</span>
                <span className="flex-1 text-[var(--color-text-primary)]">
                  {event.name}
                </span>
                <span
                  className={
                    event.hpDelta >= 0
                      ? 'text-[var(--color-positive)]'
                      : 'text-[var(--color-negative)]'
                  }
                >
                  {event.hpDelta >= 0 ? '+' : ''}{event.hpDelta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={resetDay}
        className="w-full py-3 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-text-primary)]"
      >
        내일 다시 시작하기
      </button>
    </motion.section>
  );
}
