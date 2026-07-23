import React, { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      leftIcon,
      rightIcon,
      type = 'text',
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const effectiveLeftIcon = leftIcon || icon;

    return (
      <div className={`flex flex-col gap-1.5 w-full text-left ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {effectiveLeftIcon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {effectiveLeftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-all ${
              effectiveLeftIcon ? 'pl-11' : ''
            } ${isPassword || rightIcon ? 'pr-11' : ''} ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span className="absolute right-3.5 text-slate-400 flex items-center">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
