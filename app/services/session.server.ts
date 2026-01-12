import { createCookie } from "@remix-run/cloudflare";

/**
 * Server-side session management for Auth0 tokens.
 *
 * This module provides cookie-based session storage for Auth0 access tokens,
 * enabling server-side authenticated API requests in Remix loaders.
 *
 * Flow:
 * 1. Client-side: After Auth0 login, the access token is synced to a cookie
 * 2. Server-side: Loaders read the cookie to make authenticated API requests
 * 3. Client-side: On logout, the cookie is cleared
 */

// Cookie configuration for storing the Auth0 access token
// Note: In production, AUTH_SESSION_SECRET should be a secure random string
// IMPORTANT: We use secure: false to allow cookies over HTTP in development.
// The cookie is still signed with the secret, so it can't be tampered with.
// In production on Cloudflare Pages, the connection is always HTTPS anyway.
export function createAuthCookie(secret: string) {
  return createCookie("__auth_token", {
    httpOnly: true,
    secure: false, // Allow over HTTP for local dev; HTTPS is enforced by Cloudflare in prod
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours (matches typical Auth0 token expiry)
    secrets: [secret],
  });
}

export type AuthSession = {
  accessToken: string;
  expiresAt: number; // Unix timestamp
};

/**
 * Get the auth session from the request cookies.
 */
export async function getAuthSession(
  request: Request,
  secret: string
): Promise<AuthSession | null> {
  const cookie = createAuthCookie(secret);
  const cookieHeader = request.headers.get("Cookie");
  const session = await cookie.parse(cookieHeader);

  if (!session || typeof session !== "object") {
    return null;
  }

  const { accessToken, expiresAt } = session as Partial<AuthSession>;

  if (!accessToken || typeof accessToken !== "string") {
    return null;
  }

  // Check if token has expired
  if (expiresAt && Date.now() > expiresAt) {
    return null;
  }

  return { accessToken, expiresAt: expiresAt ?? 0 };
}

/**
 * Create a Set-Cookie header to store the auth session.
 */
export async function createAuthSessionCookie(
  session: AuthSession,
  secret: string
): Promise<string> {
  const cookie = createAuthCookie(secret);
  return await cookie.serialize(session);
}

/**
 * Create a Set-Cookie header to clear the auth session.
 */
export async function destroyAuthSessionCookie(
  secret: string
): Promise<string> {
  const cookie = createAuthCookie(secret);
  return await cookie.serialize(null, { maxAge: 0 });
}
