import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-semibold text-left flex items-center justify-between cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
        }`}
      >
        <span className={selectedOption ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 left-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-xl shadow-lg shadow-slate-900/[0.08] z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer ${
                value === opt.value
                  ? 'bg-coral-50 text-coral-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={14} className="text-coral-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
