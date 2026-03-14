import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function EventTimeline() {
  const eventLog = useAppStore((s) => s.eventLog);

  if (eventLog.length === 0) {
    return (
      <section
        className="rounded-[var(--radius-lg)] p-[var(--spacing-lg)] bg-white/70 shadow-card"
        data-testid="timeline"
      >
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          오늘의 기록
        </h3>
        <p className="text-sm text-[var(--color-text-disabled)]">
          이벤트를 기록하면 여기에 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-[var(--radius-lg)] p-[var(--spacing-lg)] bg-white/70 shadow-card"
      data-testid="timeline"
    >
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
        오늘의 기록
      </h3>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {eventLog.map((log, index) => (
          <motion.li
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-2 text-sm py-1"
          >
            <span className="text-[var(--font-size-caption)] text-[var(--color-text-disabled)] w-10 shrink-0">
              {log.timestamp}
            </span>
            <span aria-hidden>{log.emoji}</span>
            <span className="flex-1 truncate text-[var(--color-text-primary)]">
              {log.name}
            </span>
            <span
              className={`font-medium tabular-nums shrink-0 ${
                log.hpDelta >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
              }`}
            >
              {log.hpDelta >= 0 ? '+' : ''}{log.hpDelta}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
