import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  value: string; // ISO or "YYYY-MM-DD"
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDate?: string; // "YYYY-MM-DD"
  minDate?: string; // "YYYY-MM-DD"
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  className = '',
  disabled = false,
  maxDate,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Lịch cao khoảng 320px -> nếu ở dưới không đủ 320px thì nảy lên trên
      setOpenUpward(spaceBelow < 320);
    }
    setIsOpen(!isOpen);
  };

  // Extract initial year, month, day safely
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Sync view when value prop changes
  useEffect(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      if (!isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format YYYY-MM-DD to DD/MM/YYYY for input display
  const displayFormatted = value
    ? (() => {
        const parts = value.split('T')[0].split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
      })()
    : placeholder;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${m}-${d}`;

    if (maxDate && dateStr > maxDate) return;
    if (minDate && dateStr < minDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className="w-full bg-slate-50/70 border border-slate-200/90 rounded-lg pl-10 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-coral-500/10 transition-all font-semibold text-left flex items-center justify-between cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
          {displayFormatted}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

      {isOpen && (
        <div
          className={`absolute left-0 w-72 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/[0.08] z-50 p-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Calendar Month & Year Controls */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {/* Select Month */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-100"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Select Year */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-100"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((dayName) => (
              <span key={dayName} className="text-[10px] font-bold text-slate-400">
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for first week padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const m = String(viewMonth + 1).padStart(2, '0');
              const d = String(day).padStart(2, '0');
              const dateStr = `${viewYear}-${m}-${d}`;

              const isSelected = value && value.startsWith(dateStr);
              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === day;

              const isDisabled = Boolean(
                (maxDate && dateStr > maxDate) || (minDate && dateStr < minDate)
              );

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center mx-auto transition cursor-pointer ${
                    isSelected
                      ? 'bg-coral-500 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-coral-50 text-coral-600 font-bold border border-coral-200/80'
                      : isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
