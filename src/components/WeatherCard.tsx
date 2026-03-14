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

export function WeatherCard() {
  const weatherState = useAppStore((s) => s.weatherState);
  const meta = getWeatherMeta(weatherState);
  const emoji = WEATHER_EMOJI[weatherState] ?? '☁️';

  return (
    <motion.section
      key={weatherState}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`weather-${weatherState} rounded-[var(--radius-lg)] p-[var(--spacing-lg)] shadow-card h-full ${
        weatherState === 'stormy' || weatherState === 'dead'
          ? 'outline outline-1 outline-white/20'
          : ''
      }`}
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