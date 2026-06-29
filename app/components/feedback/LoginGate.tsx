import React from "react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/Button";
import { LockClosedIcon } from "~/components/layout/Icons";

export interface LoginGateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  to?: string;
}

export function LoginGate({
  icon,
  title,
  description,
  ctaLabel = "Log In",
  to = "/auth/login",
}: LoginGateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light dark:bg-accent-dark/25 [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-accent dark:[&>svg]:text-accent-dark-fg">
        {icon ?? <LockClosedIcon />}
      </div>
      <h2 className="text-lg font-semibold text-brand-dark dark:text-brand-light">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
      <div className="mt-6">
        <Link to={to}>
          <Button variant="primary" type="button">
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
