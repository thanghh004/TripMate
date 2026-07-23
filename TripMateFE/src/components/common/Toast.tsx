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

const borderClassMap = {
  success: 'border-emerald-100 bg-white/95 shadow-emerald-500/5',
  error: 'border-rose-100 bg-white/95 shadow-rose-500/5',
  warning: 'border-amber-100 bg-white/95 shadow-amber-500/5',
  info: 'border-sky-100 bg-white/95 shadow-sky-500/5',
};

const ToastItem: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { removeToast } = useToast();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 600, damping: 35, mass: 0.5 }}
      onClick={() => removeToast(toast.id)}
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg w-[320px] sm:w-[360px] pointer-events-auto cursor-pointer transition-transform active:scale-[0.98] ${borderClassMap[toast.type]}`}
    >
      <div className="mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-slate-800 leading-snug">
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
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
