import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

type TooltipProps = {
  text: string;
  visible: boolean;
};

export function Tooltip({ text, visible }: TooltipProps) {
  const weatherState = useAppStore((s) => s.weatherState);
  const isDark = weatherState === 'stormy' || weatherState === 'dead';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium whitespace-nowrap shadow-elevated"
          style={{
            background: isDark ? '#FFFFFF' : '#1A1A1A',
            color: isDark ? '#1A1A1A' : '#FFFFFF',
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}