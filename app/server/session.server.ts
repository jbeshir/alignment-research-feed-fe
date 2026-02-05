import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { SESSION_MAX_AGE_SECONDS } from "~/constants/auth";

/**
 * Server-side session management using remix-auth compatible session storage.
 *
 * Flow:
 * 1. User visits /auth/login, redirects to Auth0
 * 2. Auth0 redirects back to /auth/callback with authorization code
 * 3. Server exchanges code for tokens, stores user data in session cookie
 * 4. All loaders read auth state from session
 */

export type SessionData = {
  user: {
    id: string;
    email: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  };
};

type SessionFlashData = {
  error: string;
};

/**
 * Create a session storage instance.
 * Must be called with the session secret from environment.
 */
export function createSessionStorage(secret: string) {
  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [secret],
      // Allow HTTP in dev, Cloudflare enforces HTTPS in production
      secure: false,
      // Session cookie duration - token expiry is checked separately
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  });
}

export type AppSessionStorage = ReturnType<typeof createSessionStorage>;
