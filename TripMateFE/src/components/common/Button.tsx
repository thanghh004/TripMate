import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Spinner } from './Spinner';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'google' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-950 text-white border border-transparent focus-visible:ring-slate-900',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-transparent focus-visible:ring-slate-400',
    outline:
      'border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400 bg-white',
    google:
      'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 focus-visible:ring-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-transparent focus-visible:ring-rose-600',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent focus-visible:ring-emerald-600',
    warning:
      'bg-amber-500 hover:bg-amber-600 text-white border border-transparent focus-visible:ring-amber-500',
    info:
      'bg-sky-600 hover:bg-sky-700 text-white border border-transparent focus-visible:ring-sky-600',
    ghost:
      'text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-transparent focus-visible:ring-slate-300',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;

  let selectedVariantClass = variantStyles[variant] || variantStyles.primary;
  if (className.includes('bg-')) {
    selectedVariantClass = selectedVariantClass.replace(/bg-[^\s]+/, '');
  }

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${selectedVariantClass} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <Spinner size="sm" />
        </span>
      )}

      <span className={`inline-flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : ''}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </motion.button>
  );
};

export default Button;