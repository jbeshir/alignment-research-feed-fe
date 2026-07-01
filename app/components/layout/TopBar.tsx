import { Link } from "@remix-run/react";
import { useAuth } from "~/root";
import { AuthButtons } from "./AuthButtons";
import { SettingsIcon } from "./Icons";

export function TopBar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-brand-bg dark:bg-brand-bg-dark">
      <nav className="flex justify-between items-center px-6 py-3">
        <Link
          to="/"
          className="text-lg font-semibold text-brand-dark dark:text-brand-light hover:opacity-70"
        >
          Alignment Feed
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              to="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-black/5 dark:bg-white/10 text-brand-dark dark:text-brand-light hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark dark:focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg dark:focus-visible:ring-offset-brand-bg-dark transition-opacity"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
          )}
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
}
