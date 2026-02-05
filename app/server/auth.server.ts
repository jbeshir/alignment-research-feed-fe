import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import type { AppLoadContext } from "@remix-run/cloudflare";
import {
  createSessionStorage,
  type AppSessionStorage,
  type SessionData,
} from "./session.server";
import {
  buildAuthorizationHeader,
  TOKEN_REFRESH_THRESHOLD_MS,
  DEFAULT_TOKEN_EXPIRY_SECONDS,
} from "~/constants/auth";

/**
 * User type stored in the session after authentication.
 */
type User = SessionData["user"];

/**
 * Context required from Cloudflare environment.
 */
type AuthEnv = {
  AUTH_SESSION_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DEFAULT_REDIRECT_URI: string;
  AUTH0_AUDIENCE: string;
};

// Cache for session storage and authenticator instances per secret
// (In serverless, each instance may have different env)
const sessionStorageCache = new Map<string, AppSessionStorage>();
const authenticatorCache = new Map<string, Authenticator<User>>();

/**
 * Get or create session storage for the given secret.
 */
export function getSessionStorage(
  env: Pick<AuthEnv, "AUTH_SESSION_SECRET">
): AppSessionStorage {
  const cached = sessionStorageCache.get(env.AUTH_SESSION_SECRET);
  if (cached) return cached;

  const storage = createSessionStorage(env.AUTH_SESSION_SECRET);
  sessionStorageCache.set(env.AUTH_SESSION_SECRET, storage);
  return storage;
}

/**
 * Get or create authenticator for the given environment.
 */
export function getAuthenticator(env: AuthEnv): Authenticator<User> {
  const cacheKey = `${env.AUTH_SESSION_SECRET}:${env.AUTH0_DOMAIN}:${env.AUTH0_CLIENT_ID}`;
  const cached = authenticatorCache.get(cacheKey);
  if (cached) return cached;

  const authenticator = new Authenticator<User>();

  const auth0Strategy = new Auth0Strategy<User>(
    {
      domain: env.AUTH0_DOMAIN,
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      redirectURI: `${env.AUTH0_DEFAULT_REDIRECT_URI}/auth/callback`,
      scopes: ["openid", "profile", "email", "offline_access"],
      audience: env.AUTH0_AUDIENCE,
    },
    async ({ tokens }) => {
      // Extract user info from the ID token or fetch from userinfo endpoint
      const accessToken = tokens.accessToken();
      const idToken = tokens.idToken();
      const refreshToken = tokens.refreshToken();
      const expiresIn = tokens.accessTokenExpiresInSeconds();

      // Decode ID token to get user info (it's a JWT)
      let userId = "unknown";
      let email = "";

      if (idToken) {
        try {
          const parts = idToken.split(".");
          if (parts.length >= 2 && parts[1]) {
            const payload = JSON.parse(
              Buffer.from(parts[1], "base64").toString()
            );
            userId = payload.sub || "unknown";
            email = payload.email || "";
          } else {
            throw new Error("Invalid ID token format");
          }
        } catch {
          // If we can't decode the ID token, fetch from userinfo
          const userInfoResponse = await fetch(
            `https://${env.AUTH0_DOMAIN}/userinfo`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (userInfoResponse.ok) {
            const userInfo = (await userInfoResponse.json()) as {
              sub?: string;
              email?: string;
            };
            userId = userInfo.sub || "unknown";
            email = userInfo.email || "";
          }
        }
      }

      return {
        id: userId,
        email,
        accessToken,
        refreshToken,
        expiresAt:
          Date.now() + (expiresIn ?? DEFAULT_TOKEN_EXPIRY_SECONDS) * 1000,
      };
    }
  );

  authenticator.use(auth0Strategy);
  authenticatorCache.set(cacheKey, authenticator);
  return authenticator;
}

/**
 * Get the Auth0Strategy instance for token refresh operations.
 */
function getAuth0Strategy(env: AuthEnv): Auth0Strategy<User> {
  const authenticator = getAuthenticator(env);
  return authenticator.get<Auth0Strategy<User>>("auth0")!;
}

/**
 * Server auth context for making authenticated API requests.
 */
type ServerAuthContext = {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
};

/**
 * Result from getServerAuthContext, includes optional headers for session updates.
 */
type AuthContextResult = {
  authContext: ServerAuthContext;
  /** Headers to include in the response (e.g., Set-Cookie for refreshed tokens) */
  headers?: Headers;
};

/**
 * Check if a token needs refreshing (expired or close to expiring).
 */
function shouldRefreshToken(expiresAt: number): boolean {
  return Date.now() > expiresAt - TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Refresh the access token using the refresh token.
 */
async function refreshAccessToken(
  refreshToken: string,
  env: AuthEnv
): Promise<Omit<User, "id" | "email"> | null> {
  try {
    const strategy = getAuth0Strategy(env);
    const tokens = await strategy.refreshToken(refreshToken);

    return {
      accessToken: tokens.accessToken(),
      refreshToken: tokens.refreshToken() ?? refreshToken,
      expiresAt:
        Date.now() +
        (tokens.accessTokenExpiresInSeconds() ?? DEFAULT_TOKEN_EXPIRY_SECONDS) *
          1000,
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
}

/**
 * Get auth context from request session.
 * Returns user data and access token if authenticated.
 * Automatically refreshes tokens that are expired or close to expiring.
 *
 * Uses per-request caching to ensure all loaders in a single request share
 * the same auth result, preventing multiple refresh attempts with single-use
 * refresh tokens.
 */
export async function getServerAuthContext(
  request: Request,
  context: AppLoadContext
): Promise<AuthContextResult> {
  const { authCache } = context;

  if (authCache.authContextPromise) {
    return authCache.authContextPromise as Promise<AuthContextResult>;
  }

  const resultPromise = computeServerAuthContext(
    request,
    context.cloudflare.env
  );
  authCache.authContextPromise = resultPromise;
  return resultPromise;
}

/**
 * Internal implementation of auth context computation.
 */
async function computeServerAuthContext(
  request: Request,
  env: AuthEnv
): Promise<AuthContextResult> {
  const sessionStorage = getSessionStorage(env);
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const user = session.get("user");

  if (!user) {
    return {
      authContext: {
        isAuthenticated: false,
        accessToken: null,
        user: null,
      },
    };
  }

  // Check if token needs refresh
  if (user.expiresAt && shouldRefreshToken(user.expiresAt)) {
    // Try to refresh if we have a refresh token
    if (user.refreshToken) {
      const newTokens = await refreshAccessToken(user.refreshToken, env);

      if (newTokens) {
        // Update user with new tokens
        const updatedUser: User = {
          id: user.id,
          email: user.email,
          accessToken: newTokens.accessToken,
          expiresAt: newTokens.expiresAt,
          ...(newTokens.refreshToken && {
            refreshToken: newTokens.refreshToken,
          }),
        };

        // Update session
        session.set("user", updatedUser);
        const headers = new Headers();
        headers.set("Set-Cookie", await sessionStorage.commitSession(session));

        return {
          authContext: {
            isAuthenticated: true,
            accessToken: updatedUser.accessToken,
            user: updatedUser,
          },
          headers,
        };
      }
    }

    // Refresh failed or no refresh token - clear session and treat as unauthenticated
    const headers = new Headers();
    headers.set("Set-Cookie", await sessionStorage.destroySession(session));

    return {
      authContext: {
        isAuthenticated: false,
        accessToken: null,
        user: null,
      },
      headers,
    };
  }

  return {
    authContext: {
      isAuthenticated: true,
      accessToken: user.accessToken,
      user,
    },
  };
}

/**
 * Make an authenticated fetch request from the server.
 */
async function serverAuthenticatedFetch(
  url: string,
  authContext: ServerAuthContext,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (authContext.isAuthenticated && authContext.accessToken) {
    headers.set(
      "Authorization",
      buildAuthorizationHeader(authContext.accessToken)
    );
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Result from createAuthenticatedFetch.
 */
type AuthenticatedFetchResult = {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Fetch function pre-configured with auth context */
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** Headers to include in the response (e.g., Set-Cookie for refreshed/cleared tokens) */
  headers?: Headers;
};

/**
 * Creates a fetch function pre-configured with auth context.
 *
 * Uses getServerAuthContext to ensure token refresh is handled consistently.
 * If the token is expired or close to expiring, this will refresh it.
 *
 * Returns both the fetch function and auth status so callers can avoid
 * making requests that will fail if the user is not authenticated.
 */
export async function createAuthenticatedFetch(
  request: Request,
  context: AppLoadContext
): Promise<AuthenticatedFetchResult> {
  const { authContext, headers } = await getServerAuthContext(request, context);

  const result: AuthenticatedFetchResult = {
    isAuthenticated: authContext.isAuthenticated,
    authFetch: (url: string, init?: RequestInit) =>
      serverAuthenticatedFetch(url, authContext, init),
  };

  if (headers) {
    result.headers = headers;
  }

  return result;
}
