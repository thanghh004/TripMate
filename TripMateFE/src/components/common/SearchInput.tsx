import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

/**
 * Hàm loại bỏ dấu tiếng Việt, viết thường và trim khoảng trắng thừa
 */
export const removeVietnameseAccents = (str: string = ''): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Hàm helper dùng chung để kiểm tra targetText có chứa từ khóa tìm kiếm hay không
 * (Tự động bỏ dấu, trim khoảng cách, không phân biệt hoa thường)
 */
export const matchSearchText = (targetText: string = '', query: string = ''): boolean => {
  const normalizedQuery = removeVietnameseAccents(query);
  if (!normalizedQuery) return true;
  const normalizedTarget = removeVietnameseAccents(targetText);
  return normalizedTarget.includes(normalizedQuery);
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Tìm kiếm...',
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`relative flex items-center w-full min-w-[200px] max-w-xs ${containerClassName}`}>
        <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all ${className}`}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition cursor-pointer"
            title="Xóa từ khóa"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
