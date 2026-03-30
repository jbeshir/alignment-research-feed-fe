export function LoadingRow() {
  return (
    <div className="bg-stone-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Header strip placeholder */}
      <div className="h-10 bg-stone-300 dark:bg-slate-600" />

      {/* Two-column content placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Left: title/author */}
        <div>
          <div className="space-y-2 mb-2">
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
          </div>
          <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/2" />
        </div>

        {/* Right: summary */}
        <div className="space-y-2">
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
