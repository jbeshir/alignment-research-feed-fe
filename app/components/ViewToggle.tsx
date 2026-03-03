import { ListIcon, GridIcon } from "./Icons";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 p-0.5">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "list"
            ? "bg-slate-200 text-brand-dark dark:bg-slate-600 dark:text-brand-light"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        }`}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`rounded p-1.5 transition-colors ${
          viewMode === "grid"
            ? "bg-slate-200 text-brand-dark dark:bg-slate-600 dark:text-brand-light"
            : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        }`}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
      >
        <GridIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
