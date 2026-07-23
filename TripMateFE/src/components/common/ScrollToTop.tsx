import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  /** Khoảng cách cuộn xuống (pixel) để bắt đầu hiện nút (Mặc định: 50px) */
  threshold?: number;
  className?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 50,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-200 cursor-pointer flex items-center justify-center backdrop-blur-md transition-colors duration-200 ${className}`}
          aria-label="Cuộn lên đầu trang"
          title="Cuộn lên đầu trang"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;