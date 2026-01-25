import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import "./tailwind.css";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import React, { createContext, useContext } from "react";
import { getServerAuthContext } from "~/server/auth.server";

function NavigationProgressBar() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div className="h-full bg-brand-dark dark:bg-brand-light animate-progress-bar" />
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100 dark:bg-slate-800">
        <NavigationProgressBar />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Auth context for passing authentication state to components.
 * With server-side auth, this is simply a boolean from the loader.
 */
type AuthContextType = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within root App component");
  }
  return context;
}

type LoaderData = {
  isAuthenticated: boolean;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const { authContext, headers } = await getServerAuthContext(request, env);

  return json<LoaderData>(
    { isAuthenticated: authContext.isAuthenticated },
    headers ? { headers } : undefined
  );
};

export default function App() {
  const { isAuthenticated } = useLoaderData<LoaderData>();

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
