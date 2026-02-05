import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "@remix-run/react";
import "./tailwind.css";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import React, { createContext, useContext } from "react";
import { getServerAuthContext } from "~/server/auth.server";
import { SentryProvider } from "~/contexts/SentryContext";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

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
  sentryDsn: string | undefined;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authContext, headers } = await getServerAuthContext(request, context);

  return json<LoaderData>(
    {
      isAuthenticated: authContext.isAuthenticated,
      sentryDsn: context.cloudflare.env.SENTRY_DSN,
    },
    headers ? { headers } : undefined
  );
};

export default function App() {
  const { isAuthenticated, sentryDsn } = useLoaderData<LoaderData>();

  return (
    <SentryProvider dsn={sentryDsn}>
      <AuthContext.Provider value={{ isAuthenticated }}>
        <Outlet />
      </AuthContext.Provider>
    </SentryProvider>
  );
}

/**
 * Global error boundary for unhandled errors.
 * Catches errors at the root level and displays a user-friendly error page.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  // Report error to Sentry
  captureRemixErrorBoundaryError(error);

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again later.";
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you're looking for doesn't exist.";
    } else if (error.status === 500) {
      title = "Server error";
      message = "Something went wrong on our end. Please try again later.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    // Don't expose error details in production
    if (process.env.NODE_ENV === "development") {
      message = error.message;
    }
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${title} - Alignment Feed`}</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100 dark:bg-slate-800 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          {statusCode && (
            <p className="text-6xl font-bold text-slate-300 dark:text-slate-600 mb-4">
              {statusCode}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">{message}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-dark dark:bg-brand-light text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
