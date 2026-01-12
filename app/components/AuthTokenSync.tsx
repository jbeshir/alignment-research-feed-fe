import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useContext } from "react";
import { useFetcher, useRevalidator } from "@remix-run/react";
import { AuthContext } from "~/contexts/AuthContext";

/**
 * Syncs Auth0 access token to a server-side cookie for SSR authenticated requests.
 *
 * Only syncs when necessary:
 * - Login: when transitioning from known logged-out to logged-in
 * - Logout: when transitioning from logged-in to logged-out
 * - Skips sync on initial load if server already had valid auth
 */
export function AuthTokenSync() {
  const authContext = useContext(AuthContext);
  const serverWasAuthenticated = authContext?.serverWasAuthenticated ?? false;
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const fetcher = useFetcher<{ success?: boolean }>();
  const revalidator = useRevalidator();

  // Track previous auth state: null = still loading, boolean = known state
  const prevAuthState = useRef<boolean | null>(null);

  // Revalidate after successful sync
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  useEffect(() => {
    if (isLoading) return;

    const prevState = prevAuthState.current;
    const isInitialLoad = prevState === null;

    // Update tracking before any early returns
    prevAuthState.current = isAuthenticated;

    // Logout: was authenticated, now isn't
    if (prevState === true && !isAuthenticated) {
      fetcher.submit(
        { action: "logout" },
        { method: "POST", action: "/api/auth/sync" }
      );
      return;
    }

    // Not authenticated, nothing to sync
    if (!isAuthenticated) return;

    // Login: was explicitly logged out, now authenticated
    const isExplicitLogin = prevState === false;

    // Sync on explicit login or initial load without server auth
    if (isExplicitLogin || (isInitialLoad && !serverWasAuthenticated)) {
      (async () => {
        try {
          const accessToken = await getAccessTokenSilently();
          if (accessToken) {
            fetcher.submit(
              { action: "login", accessToken },
              { method: "POST", action: "/api/auth/sync" }
            );
          }
        } catch (error) {
          console.error("[AuthTokenSync] Failed to get access token:", error);
        }
      })();
    }
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    fetcher,
    serverWasAuthenticated,
  ]);

  return null;
}
