export function LoadingRow() {
  return (
    <div className="bg-stone-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Header strip placeholder - mirrors the coloured category band */}
      <div className="h-10 bg-stone-300 dark:bg-slate-700 border-l-4 border-stone-400 dark:border-slate-600" />

      {/* Two-column content placeholder (2fr / 3fr like the row) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        {/* Left: thumbnail + title/author */}
        <div className="md:col-span-2 flex gap-3">
          <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded bg-stone-100 dark:bg-stone-800" />
          <div className="min-w-0 flex-1">
            <div className="space-y-2 mb-2">
              <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
            <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>

        {/* Right: summary */}
        <div className="md:col-span-3 space-y-2">
          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
      </div>

      {/* Action bar placeholder */}
      <div className="px-4 py-2 border-t border-stone-100 dark:border-slate-700 flex gap-2">
        <div className="h-6 w-8 bg-stone-200 dark:bg-slate-700 rounded" />
        <div className="h-6 w-8 bg-stone-200 dark:bg-slate-700 rounded" />
        <div className="h-6 w-16 bg-stone-200 dark:bg-slate-700 rounded" />
        <div className="h-6 w-16 bg-stone-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
