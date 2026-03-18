import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

type TooltipProps = {
  text: string;
  visible: boolean;
  anchorRef: React.RefObject<HTMLElement>;
};

export function Tooltip({ text, visible, anchorRef }: TooltipProps) {
  const weatherState = useAppStore((s) => s.weatherState);
  const isDark = weatherState === 'stormy' || weatherState === 'dead';
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 44,   // scrollY 제거 — fixed는 viewport 기준
        left: rect.left + rect.width / 2,  // scrollX 제거
      });
    }
  }, [visible, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',  // absolute → fixed
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: isDark ? '#FFFFFF' : '#1A1A1A',
            color: isDark ? '#1A1A1A' : '#FFFFFF',
          }}
          className="px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium whitespace-nowrap shadow-elevated"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}