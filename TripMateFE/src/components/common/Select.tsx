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
  direction?: 'auto' | 'down' | 'up';
  searchable?: boolean;
}

// Helper bỏ dấu Tiếng Việt, chuyển về chữ thường và xóa sạch khoảng trắng
const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, '');
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  className = '',
  disabled = false,
  direction = 'auto',
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Lọc thông minh: Không dấu, không khoảng trắng, không phân biệt hoa/thường
  const normalizedQuery = normalizeString(searchQuery);
  const filteredOptions = options.filter((opt) =>
    normalizeString(opt.label).includes(normalizedQuery)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      if (direction === 'up') {
        setOpenUpwards(true);
      } else if (direction === 'down') {
        setOpenUpwards(false);
      } else {
        setOpenUpwards(spaceBelow < 250);
      }
    }
    setIsOpen(!isOpen);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Button kích thước nhỏ gọn bo nhẹ góc (px-4 py-2 text-xs rounded-lg) */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full bg-slate-50 border border-slate-200/90 rounded-lg px-4 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-coral-500/10 transition-all font-semibold text-left flex items-center justify-between cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
        }`}
      >
        <span className={`truncate whitespace-nowrap ${selectedOption ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute right-0 left-0 bg-white border border-slate-200/90 rounded-lg shadow-lg shadow-slate-900/[0.08] z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Ô Nhập Tìm Kiếm Tinh Gọn */}
          {searchable && options.length > 5 && (
            <div className="p-1.5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-coral-400 transition"
              />
            </div>
          )}

          {/* Danh sách Tùy chọn Ẩn hoàn toàn Scrollbar */}
          <div className="max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full px-4 py-2 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer ${
                    value === opt.value
                      ? 'bg-coral-50 text-coral-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check size={14} className="text-coral-500 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-3 text-xs text-slate-400 font-medium text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
