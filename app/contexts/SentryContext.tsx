import * as Sentry from "@sentry/remix";
import { useLocation, useMatches } from "@remix-run/react";
import { useEffect, useRef, type ReactNode } from "react";

type SentryProviderProps = {
  dsn: string | undefined;
  children: ReactNode;
};

/**
 * Provider that initializes Sentry client-side.
 * Pass the DSN from loader data - if undefined, Sentry won't initialize.
 */
export function SentryProvider({ dsn, children }: SentryProviderProps) {
  const location = useLocation();
  const matches = useMatches();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (dsn && !isInitialized.current && !Sentry.isInitialized()) {
      Sentry.init({
        dsn,
        integrations: [
          Sentry.browserTracingIntegration({
            useEffect,
            useLocation: () => location,
            useMatches: () => matches,
          }),
        ],
        tracesSampleRate: 0.1,
      });
      isInitialized.current = true;
    }
  }, [dsn, location, matches]);

  return <>{children}</>;
}
