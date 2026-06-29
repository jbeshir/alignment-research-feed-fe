import React from "react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";

export interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center text-center px-4 py-16"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-200/70 dark:bg-slate-800 [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-stone-500 dark:[&>svg]:text-slate-400">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.to ? (
            <Link to={action.to}>
              <Button variant="primary" type="button">
                {action.label}
              </Button>
            </Link>
          ) : action.onClick ? (
            <Button variant="primary" type="button" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
