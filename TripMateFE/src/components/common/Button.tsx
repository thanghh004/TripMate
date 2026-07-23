import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Spinner } from './Spinner';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'google' | 'danger' | 'ghost';
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
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-950 text-white border border-transparent focus-visible:ring-slate-900',
    secondary:
      'bg-slate-100 hover:bg-slate-300 text-slate-900 border border-transparent focus-visible:ring-slate-400',
    outline:
      'border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400 bg-transparent',
    google:
      'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 focus-visible:ring-slate-300',
    danger:
      'bg-red-600 hover:bg-red-800 text-white border border-transparent focus-visible:ring-red-600',
    ghost:
      'text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-transparent focus-visible:ring-slate-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;