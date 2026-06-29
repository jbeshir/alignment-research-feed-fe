import { Link } from "@remix-run/react";

export type Tab = {
  id: string;
  label: string;
  /** Path to navigate to for this tab */
  to: string;
};

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  /** Called when a tab requires special handling (e.g., auth check). Return false to prevent navigation. */
  onBeforeNavigate?: (tabId: string) => boolean;
}

export function Tabs({ tabs, activeTab, onBeforeNavigate }: TabsProps) {
  return (
    <nav className="flex gap-6 overflow-x-auto min-w-0 border-b border-stone-300 dark:border-slate-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        const baseClassName = `pb-3 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
          isActive
            ? "text-slate-900 dark:text-slate-100"
            : "text-stone-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200"
        }`;

        return (
          <Link
            key={tab.id}
            to={tab.to}
            preventScrollReset
            onClick={e => {
              if (onBeforeNavigate && !onBeforeNavigate(tab.id)) {
                e.preventDefault();
              }
            }}
            className={baseClassName}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent dark:bg-accent-dark-fg" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
