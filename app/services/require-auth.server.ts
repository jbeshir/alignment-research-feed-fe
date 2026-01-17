import type { LoaderFunctionArgs, Session } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import {
  getSessionStorage,
  type AuthEnv,
  type User,
} from "./auth.server";
import type { AppSessionStorage } from "./session.server";
import type { SessionData, SessionFlashData } from "./session.server";
import {
  refreshAccessToken,
  shouldRefreshToken,
} from "./token-refresh.server";

export type AuthResult = {
  user: User;
  session: Session<SessionData, SessionFlashData>;
  sessionStorage: AppSessionStorage;
  /** If true, the session was updated (e.g., token refreshed) and needs to be committed */
  sessionUpdated: boolean;
};

/**
 * Get the authenticated user from the session, with automatic token refresh.
 *
 * Returns null if not authenticated. Does not redirect.
 *
 * @example
 * ```ts
 * export async function loader({ request, context }: LoaderFunctionArgs) {
 *   const auth = await getAuthenticatedUser({ request, context });
 *   if (!auth) {
 *     // User is not authenticated, return public data
 *     return json({ articles, isAuthenticated: false });
 *   }
 *
 *   // User is authenticated, fetch with auth
 *   const response = await fetch(url, {
 *     headers: { Authorization: `Bearer ${auth.user.accessToken}` }
 *   });
 *
 *   // If session was updated, commit it
 *   const headers = auth.sessionUpdated
 *     ? { "Set-Cookie": await auth.sessionStorage.commitSession(auth.session) }
 *     : undefined;
 *
 *   return json({ articles, isAuthenticated: true }, { headers });
 * }
 * ```
 */
export async function getAuthenticatedUser(
  args: LoaderFunctionArgs
): Promise<AuthResult | null> {
  const { request, context } = args;
  const env = context.cloudflare.env as AuthEnv;
  const sessionStorage = getSessionStorage(env);
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return null;
  }

  // Check if token is expired
  if (user.expiresAt && Date.now() > user.expiresAt) {
    // Token is expired, clear session and return null
    return null;
  }

  let sessionUpdated = false;

  // Check if token needs refresh (within threshold of expiry)
  if (user.refreshToken && shouldRefreshToken(user.expiresAt)) {
    const refreshed = await refreshAccessToken(user.refreshToken, env);
    if (refreshed) {
      // Update user with new tokens
      user.accessToken = refreshed.accessToken;
      user.refreshToken = refreshed.refreshToken ?? user.refreshToken;
      user.expiresAt = refreshed.expiresAt;
      session.set("user", user);
      sessionUpdated = true;
    }
    // If refresh failed but token isn't expired yet, continue with current token
  }

  return { user, session, sessionStorage, sessionUpdated };
}

/**
 * Require authentication. Redirects to login if not authenticated.
 *
 * @example
 * ```ts
 * export async function loader({ request, context }: LoaderFunctionArgs) {
 *   const auth = await requireAuth({ request, context });
 *   // User is guaranteed to be authenticated here
 *   return json({ user: auth.user });
 * }
 * ```
 */
export async function requireAuth(args: LoaderFunctionArgs): Promise<AuthResult> {
  const auth = await getAuthenticatedUser(args);

  if (!auth) {
    // Store the current URL to redirect back after login
    const url = new URL(args.request.url);
    const loginUrl = new URL("/auth/login", url.origin);
    // Could add returnTo parameter here if needed
    throw redirect(loginUrl.toString());
  }

  return auth;
}

/**
 * Helper to create response headers with session cookie if needed.
 */
export async function getSessionHeaders(
  auth: AuthResult | null
): Promise<HeadersInit | undefined> {
  if (!auth?.sessionUpdated) {
    return undefined;
  }

  return {
    "Set-Cookie": await auth.sessionStorage.commitSession(auth.session),
  };
}
