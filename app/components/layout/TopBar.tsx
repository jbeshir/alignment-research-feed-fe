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
            <Link to="/settings" aria-label="Settings">
              <SettingsIcon className="w-5 h-5 text-brand-dark dark:text-brand-light hover:opacity-70" />
            </Link>
          )}
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
}
