export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="aspect-video bg-slate-200 dark:bg-slate-700" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Source tag */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />

        {/* Author */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>

        {/* Metrics */}
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}
