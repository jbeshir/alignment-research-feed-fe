import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { ExclamationTriangleIcon } from "~/components/layout/Icons";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  backTo?: string;
  backLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  backTo,
  backLabel = "Back to feed",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center px-4 py-16"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/25 [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-red-500 dark:[&>svg]:text-red-400">
        <ExclamationTriangleIcon />
      </div>
      <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
      {(onRetry || backTo) && (
        <div className="mt-6 flex items-center gap-3">
          {onRetry && (
            <Button variant="primary" type="button" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {backTo && (
            <Link to={backTo}>
              <Button variant="outline" type="button">
                {backLabel}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
