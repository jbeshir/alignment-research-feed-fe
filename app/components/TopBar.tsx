import LoginLogoutButton from "~/components/LoginLogoutButton";
import { Link } from "@remix-run/react";

export default function TopBar() {
  return (
    <div className="flex flex-row items-center bg-slate-50 dark:bg-slate-950">
      <h1 className="inline-block grow p-5 text-5xl text-left font-medium text-black dark:text-white">
        <Link to="/">Alignment Feed</Link>
      </h1>
      <div className="inline-block p-5 text-right font-medium text-black dark:text-white">
        <LoginLogoutButton />
      </div>
    </div>
  );
}
