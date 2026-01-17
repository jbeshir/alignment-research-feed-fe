export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden animate-pulse h-full flex flex-col">
      {/* Header strip placeholder */}
      <div className="h-12 bg-slate-300 dark:bg-slate-600 flex-shrink-0" />

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Date */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2" />

        {/* Author */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1" />

        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Engagement metrics */}
        <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}
