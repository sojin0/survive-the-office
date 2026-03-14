import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { WeatherState } from '../types';

function getHpBarGradient(weather: WeatherState): string {
  switch (weather) {
    case 'sunny':        return 'linear-gradient(90deg, #F6A623 0%, #F5D020 100%)';
    case 'cloudy_sunny': return 'linear-gradient(90deg, #90A4AE 0%, #546E7A 100%)';
    case 'cloudy':       return 'linear-gradient(90deg, #78909C 0%, #37474F 100%)';
    case 'rainy':        return 'linear-gradient(90deg, #5C6BC0 0%, #283593 100%)';
    case 'stormy':       return 'linear-gradient(90deg, #455A64 0%, #1A1A1A 100%)';
    case 'dead':         return 'linear-gradient(90deg, #424242 0%, #000000 100%)';
    default:             return 'linear-gradient(90deg, #F6A623 0%, #F5D020 100%)';
  }
}

function getHpMessage(delta: number): string {
  if (delta > 0) {
    if (delta >= 20) return `+${delta} 🎉 대박! 오늘 최고예요!`;
    if (delta >= 15) return `+${delta} 💪 좋아요! 이 기세!`;
    if (delta >= 10) return `+${delta} 😊 기분 좋은 순간!`;
    return `+${delta} ☕ 소소한 행복!`;
  } else {
    if (delta <= -20) return `${delta} 😱 많이 힘드셨죠...`;
    if (delta <= -15) return `${delta} 😤 버텨요, 잘하고 있어요!`;
    if (delta <= -10) return `${delta} 😮‍💨 괜찮아요, 지나갈 거예요`;
    return `${delta} 🙂 조금만 더 힘내요!`;
  }
}

function getHpFixedMessage(hp: number): string | null {
  if (hp >= 100) return '오늘만 같아라 ✨';
  if (hp <= 0) return '날 내버려둬.... 💀';
  return null;
}

function getHpStatusText(hp: number): { label: string; emoji: string } {
  if (hp >= 81) return { label: '최상', emoji: '💪' };
  if (hp >= 61) return { label: '양호', emoji: '🙂' };
  if (hp >= 41) return { label: '보통', emoji: '😐' };
  if (hp >= 21) return { label: '주의', emoji: '😓' };
  if (hp >= 1)  return { label: '위험', emoji: '😨' };
  return { label: '전멸', emoji: '💀' };
}

export function HPGauge() {
  const hp = useAppStore((s) => s.hp);
  const weatherState = useAppStore((s) => s.weatherState);
  const isCritical = hp <= 20 && hp > 0;

  const prevHpRef = useRef(hp);
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delta = hp - prevHpRef.current;
    if (delta !== 0) {
      setToast(getHpMessage(delta));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), 2200);
    }
    prevHpRef.current = hp;
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hp]);

  const status = getHpStatusText(hp);
  const fixedMessage = getHpFixedMessage(hp);

  return (
    <section
      className="glass-card h-full flex flex-col justify-center"
      style={{ padding: '12px 16px' }}
      data-testid="hp-gauge"
      aria-label="현재 HP 게이지"
    >
      {/* HP 수치 + 상태 뱃지 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>HP</span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-text-secondary)' }}
          >
            {status.emoji} {status.label}
          </span>
          <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-hp-text)' }} data-testid="hp-value">
            {hp}
          </span>
        </div>
      </div>

      {/* 토스트 / 고정 메시지 / 위기 메시지 */}
      <div className="relative h-6 mb-2">
        <AnimatePresence>
          {toast && !fixedMessage && (
            <motion.p
              key={toast}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 text-xs text-center font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
        {fixedMessage && (
          <p className="text-xs text-center font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {fixedMessage}
          </p>
        )}
        {isCritical && !toast && !fixedMessage && (
          <p className="text-xs text-center animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
            ⚠️ 위험! 간식이 필요한 순간이에요
          </p>
        )}
      </div>

      {/* HP 바 */}
      <div
        className="h-3 rounded-[var(--radius-full)] overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.08)' }}
        role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={100}
      >
        <motion.div
          className={`h-full rounded-[var(--radius-full)] relative overflow-hidden ${isCritical ? 'hp-pulse' : ''}`}
          style={{ background: getHpBarGradient(weatherState) }}
          initial={false}
          animate={{ width: `${hp}%` }}
          transition={{ type: 'easeOut', duration: 0.4 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
        </motion.div>
      </div>

      {/* 바 아래 — HP 범위 힌트 */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>0</span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>50</span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>100</span>
      </div>
    </section>
  );
}