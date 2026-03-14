import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { Tooltip } from './Tooltip';

const TOOLTIP_DURATION_MS = 2000;

type EventButtonProps = {
  event: EventItem;
};

function getTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function EventButton({ event }: EventButtonProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const addEvent = useAppStore((s) => s.addEvent);
  const isRetired = useAppStore((s) => s.isRetired);

  const handleClick = useCallback(() => {
    if (isRetired) return;
    setTooltipVisible(true);
    addEvent({
      eventId: event.id,
      name: event.name,
      emoji: event.emoji,
      hpDelta: event.hpDelta,
      timestamp: getTimeString(),
    });
    const t = setTimeout(() => setTooltipVisible(false), TOOLTIP_DURATION_MS);
    return () => clearTimeout(t);
  }, [event, addEvent, isRetired]);

  const isPositive = event.hpDelta > 0;
  const deltaText = isPositive ? `+${event.hpDelta}` : String(event.hpDelta);

  return (
    <div className="relative">
      <Tooltip text={`${event.description} ${event.emoji}`} visible={tooltipVisible} />
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isRetired}
        whileHover={!isRetired ? { scale: 1.03, y: -1 } : undefined}
        whileTap={!isRetired ? { scale: 0.97 } : undefined}
        className="
          w-full rounded-[var(--radius-md)] p-3 text-left
          flex items-center gap-2 min-h-[52px]
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-shadow duration-150
        "
        style={{
          background: isPositive
            ? 'var(--color-positive-bg)'
            : 'var(--color-negative-bg)',
          boxShadow: 'var(--shadow-card)',
          border: 'none',
        }}
        data-testid={`event-${event.id}`}
        aria-label={`${event.name} ${deltaText} HP`}
      >
        {/* 이모지 */}
        <span className="text-xl shrink-0" aria-hidden>
          {event.emoji}
        </span>

        {/* 이벤트명 */}
        <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)] truncate">
          {event.name}
        </span>

        {/* HP 변동값 — 모노톤 */}
        <span
          className="text-sm font-bold tabular-nums shrink-0"
          style={{
            color: isPositive
              ? 'var(--color-positive-text)'
              : 'var(--color-negative-text)',
          }}
        >
          {deltaText}
        </span>
      </motion.button>
    </div>
  );
}