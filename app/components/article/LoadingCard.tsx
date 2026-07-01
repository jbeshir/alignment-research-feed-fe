export function LoadingCard() {
  return (
    <div className="bg-stone-50 dark:bg-surface-1 rounded-xl shadow-card overflow-hidden animate-pulse h-full flex flex-col">
      {/* Header strip placeholder - mirrors the coloured category band */}
      <div className="h-12 bg-stone-300 dark:bg-slate-700 border-l-4 border-stone-400 dark:border-slate-600 flex-shrink-0" />

      {/* Thumbnail block - mirrors the aspect-video thumbnail */}
      <div className="aspect-video w-full bg-stone-100 dark:bg-stone-800" />

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Date */}
        <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/4 mb-2" />

        {/* Author */}
        <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/3 mb-1" />

        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Engagement metrics */}
        <div className="flex gap-4 pt-2 border-t border-stone-100 dark:border-slate-700 mt-auto">
          <div className="h-4 w-6 bg-stone-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-6 bg-stone-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}
