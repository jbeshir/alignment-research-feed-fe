import { AuthButtons } from "./AuthButtons";

export function TopBar() {
  return (
    <header className="bg-brand-bg dark:bg-brand-bg-dark">
      <nav className="flex justify-end items-center px-6 py-3">
        <AuthButtons />
      </nav>
    </header>
  );
}
