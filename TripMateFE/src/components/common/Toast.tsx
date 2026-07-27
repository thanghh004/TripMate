import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastMessage } from '../../context/ToastContext';

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
};

const styleMap = {
  success: {
    border: 'border-emerald-200/70',
    bar: 'bg-emerald-500',
    ring: 'shadow-[0_8px_30px_-8px_rgba(16,185,129,0.35)]',
  },
  error: {
    border: 'border-rose-200/70',
    bar: 'bg-rose-500',
    ring: 'shadow-[0_8px_30px_-8px_rgba(244,63,94,0.35)]',
  },
  warning: {
    border: 'border-amber-200/70',
    bar: 'bg-amber-500',
    ring: 'shadow-[0_8px_30px_-8px_rgba(245,158,11,0.35)]',
  },
  info: {
    border: 'border-sky-200/70',
    bar: 'bg-sky-500',
    ring: 'shadow-[0_8px_30px_-8px_rgba(14,165,233,0.35)]',
  },
};

const DEFAULT_DURATION = 4000;

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { removeToast } = useToast();
  const duration = (toast as any).duration ?? DEFAULT_DURATION;
  const style = styleMap[toast.type];

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: 'easeIn' } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => removeToast(toast.id)}
      className={`relative flex items-start gap-3 p-4 pr-3 rounded-2xl border bg-white/95 backdrop-blur-sm overflow-hidden ${style.ring} ${style.border} w-[320px] sm:w-[360px] pointer-events-auto cursor-pointer`}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-slate-800 leading-snug pt-0.5">
        {toast.message}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
      >
        <X size={16} />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[3px] ${style.bar} opacity-70`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-full">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};