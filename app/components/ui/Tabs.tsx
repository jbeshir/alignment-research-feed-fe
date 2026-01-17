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

export function Tabs({
  tabs,
  activeTab,
  onBeforeNavigate,
}: TabsProps) {
  return (
    <nav className="flex gap-6 border-b border-slate-200" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        const baseClassName = `pb-3 text-sm font-medium transition-colors relative ${
          isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
        }`;

        return (
          <Link
            key={tab.id}
            to={tab.to}
            preventScrollReset
            onClick={(e) => {
              if (onBeforeNavigate && !onBeforeNavigate(tab.id)) {
                e.preventDefault();
              }
            }}
            className={baseClassName}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
