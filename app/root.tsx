import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import React, { createContext, useContext } from "react";
import { getServerAuthContext } from "~/services/auth.server";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}})();`,
          }}
        />
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

export const loader = async ({
  request,
  context,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  const env = context.cloudflare.env;
  const authContext = await getServerAuthContext(request, env);

  return {
    isAuthenticated: authContext.isAuthenticated,
  };
};

export default function App() {
  const { isAuthenticated } = useLoaderData<LoaderData>();

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
