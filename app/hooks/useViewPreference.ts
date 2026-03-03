import { useState, useCallback } from "react";
import type { ViewMode } from "~/components/ViewToggle";

const STORAGE_KEY = "viewPreference";

function readPreference(): ViewMode {
  if (typeof window === "undefined") return "list";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "grid" ? "grid" : "list";
}

export function useViewPreference(): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewModeState] = useState<ViewMode>(readPreference);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  return [viewMode, setViewMode];
}
