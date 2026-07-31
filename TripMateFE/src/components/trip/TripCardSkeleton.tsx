import React from 'react';

export const TripCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left space-y-3.5 p-4 animate-pulse select-none">
      {/* Header Skeleton: Avatar + Name + Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-1.5">
            <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
            <div className="w-20 h-2.5 bg-slate-200 rounded-md" />
          </div>
        </div>
        <div className="w-24 h-5 bg-slate-200 rounded-full" />
      </div>

      {/* Title & Tag Skeleton */}
      <div className="space-y-2.5">
        <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
        <div className="flex items-center gap-2">
          <div className="w-28 h-6 bg-slate-200 rounded-md" />
          <div className="w-20 h-6 bg-slate-200 rounded-md" />
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-md" />
      </div>

      {/* Cover Image Skeleton */}
      <div className="w-full aspect-video bg-slate-200 rounded-lg" />

      {/* Footer Skeleton */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-4 bg-slate-200 rounded-md" />
          <div className="w-12 h-4 bg-slate-200 rounded-md" />
        </div>
        <div className="w-36 h-3 bg-slate-200 rounded-md" />
      </div>
    </div>
  );
};

export default TripCardSkeleton;
