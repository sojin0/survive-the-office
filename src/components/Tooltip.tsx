import { motion, AnimatePresence } from 'framer-motion';

type TooltipProps = {
  text: string;
  visible: boolean;
};

export function Tooltip({ text, visible }: TooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-text-primary)] text-white text-sm font-medium whitespace-nowrap shadow-elevated"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
