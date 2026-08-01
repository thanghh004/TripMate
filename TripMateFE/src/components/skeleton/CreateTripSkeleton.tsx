import React from 'react';

export const CreateTripSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none animate-pulse">
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-8 max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header Title Skeleton */}
        <div className="space-y-2 text-left">
          <div className="w-56 h-7 bg-slate-200 rounded-lg" />
          <div className="w-96 h-4 bg-slate-200 rounded-md" />
        </div>

        {/* Stepper Wizard Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="w-24 h-4 bg-slate-200 rounded-md hidden sm:block" />
          </div>
          <div className="w-12 h-1 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="w-24 h-4 bg-slate-200 rounded-md hidden sm:block" />
          </div>
          <div className="w-12 h-1 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="w-24 h-4 bg-slate-200 rounded-md hidden sm:block" />
          </div>
        </div>

        {/* Main Form Body Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-6 text-left">
          {/* Title Field Skeleton */}
          <div className="space-y-2">
            <div className="w-36 h-4 bg-slate-200 rounded-md" />
            <div className="w-full h-11 bg-slate-200 rounded-xl" />
          </div>

          {/* Grid 2 Columns Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="w-28 h-4 bg-slate-200 rounded-md" />
              <div className="w-full h-11 bg-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-28 h-4 bg-slate-200 rounded-md" />
              <div className="w-full h-11 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Grid 2 Columns Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 rounded-md" />
              <div className="w-full h-11 bg-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 rounded-md" />
              <div className="w-full h-11 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Description Field Skeleton */}
          <div className="space-y-2">
            <div className="w-32 h-4 bg-slate-200 rounded-md" />
            <div className="w-full h-28 bg-slate-200 rounded-xl" />
          </div>

          {/* Buttons Footer Skeleton */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="w-24 h-10 bg-slate-200 rounded-xl" />
            <div className="w-32 h-10 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTripSkeleton;
