import { useState, useCallback, useEffect } from "react";
import { SearchIcon } from "./Icons";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search for alignment, public policy, recent research, and more",
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
        if (localValue.length >= 2 || localValue.length === 0) {
          onSearch(localValue);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, onSearch, debounceMs]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onChange(localValue);
        onSearch(localValue);
      }
    },
    [localValue, onChange, onSearch]
  );

  const handleSearchClick = useCallback(() => {
    onChange(localValue);
    onSearch(localValue);
  }, [localValue, onChange, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-6 py-4 pr-14 text-base text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-dark dark:focus:ring-brand-light focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
        aria-label="Search articles"
      />
      <button
        onClick={handleSearchClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        aria-label="Submit search"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
