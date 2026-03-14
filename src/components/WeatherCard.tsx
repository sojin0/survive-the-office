import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getWeatherMeta } from '../utils/hp';

const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️',
  cloudy_sunny: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  dead: '💀',
};

const BG_GRADIENT: Record<string, string> = {
  sunny: 'from-[var(--color-sunny-bg)] to-amber-50',
  cloudy_sunny: 'from-[var(--color-cloudy-bg)] to-slate-100',
  cloudy: 'from-[var(--color-cloudy-bg)] to-gray-200',
  rainy: 'from-[var(--color-rain-bg)] to-indigo-100',
  stormy: 'from-[var(--color-storm-bg)] to-slate-800',
  dead: 'from-slate-900 to-slate-800',
};

export function WeatherCard() {
  const weatherState = useAppStore((s) => s.weatherState);
  const meta = getWeatherMeta(weatherState);
  const emoji = WEATHER_EMOJI[weatherState] ?? '☁️';
  const bgClass = BG_GRADIENT[weatherState] ?? 'from-gray-100 to-gray-200';

  return (
    <motion.section
      key={weatherState}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-[var(--radius-lg)] p-[var(--spacing-lg)] bg-gradient-to-br ${bgClass} shadow-card h-full`}
      data-testid="weather-card"
    >
      <div className="flex items-center gap-3 h-full">
        <span className="text-4xl select-none" role="img" aria-label={meta.ariaLabel} data-testid="weather-icon">
          {emoji}
        </span>
        <div>
          <p className="font-bold text-[var(--color-text-primary)] text-lg">{meta.label}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{meta.message}</p>
        </div>
      </div>
    </motion.section>
  );
}