import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select, type SelectOption } from './Select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  if (totalItems === 0 || totalPages <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with intelligent truncation (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const selectOptions: SelectOption[] = pageSizeOptions.map((size) => ({
    label: `${size} bản ghi/trang`,
    value: size.toString(),
  }));

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-3 rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-600 ${className}`}
    >
      {/* Left: Summary Info */}
      <div className="flex items-center gap-3">
        <p className="font-medium text-slate-500">
          Hiển thị{' '}
          <span className="font-bold text-slate-800">{startItem}</span> -{' '}
          <span className="font-bold text-slate-800">{endItem}</span> trên tổng số{' '}
          <span className="font-bold text-slate-800">{totalItems}</span> kết quả
        </p>

        {onPageSizeChange && (
          <div className="w-40 hidden sm:block">
            <Select
              options={selectOptions}
              value={pageSize.toString()}
              onChange={(val) => onPageSizeChange(Number(val))}
            />
          </div>
        )}
      </div>

      {/* Right: Compact Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md border transition ${
            currentPage === 1
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Trang đầu"
        >
          <ChevronsLeft size={13} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md border transition ${
            currentPage === 1
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Trang trước"
        >
          <ChevronLeft size={13} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`min-w-[26px] h-7 px-2 rounded-md font-bold text-[11px] transition cursor-pointer ${
                  currentPage === page
                    ? 'bg-coral-500 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 font-bold select-none text-[11px]">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md border transition ${
            currentPage === totalPages
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Trang sau"
        >
          <ChevronRight size={13} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md border transition ${
            currentPage === totalPages
              ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
          }`}
          title="Trang cuối"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
