import React from 'react';

export const MyTripRowSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden text-left animate-pulse select-none">
    {/* Top Banner Skeleton */}
    <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-48 h-4 bg-slate-200 rounded-md" />
        <div className="w-24 h-5 bg-slate-200 rounded-full" />
      </div>
      <div className="w-28 h-5 bg-slate-200 rounded-md" />
    </div>

    {/* Body Content Skeleton */}
    <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 flex-1">
        {/* Cột 1 */}
        <div className="w-full sm:w-[320px] shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
            <div className="w-40 h-3.5 bg-slate-200 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
            <div className="w-56 h-3.5 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Cột 2 */}
        <div className="w-full sm:w-[220px] shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
            <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
            <div className="w-28 h-3.5 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* Cột 3: Nút bấm */}
      <div className="flex items-center gap-2 pt-2 md:pt-0 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-100">
        <div className="w-24 h-8 bg-slate-200 rounded-md" />
        <div className="w-24 h-8 bg-slate-200 rounded-md" />
      </div>
    </div>
  </div>
);

export default MyTripRowSkeleton;
