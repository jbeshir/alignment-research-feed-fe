import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import {
  createSessionStorage,
  type AppSessionStorage,
  type SessionData,
} from "./session.server";
import { buildAuthorizationHeader } from "~/constants/auth";

/**
 * User type stored in the session after authentication.
 */
export type User = SessionData["user"];

/**
 * Context required from Cloudflare environment.
 */
export type AuthEnv = {
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
export function getSessionStorage(env: Pick<AuthEnv, "AUTH_SESSION_SECRET">): AppSessionStorage {
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
        expiresAt: Date.now() + (expiresIn ?? 86400) * 1000,
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
export function getAuth0Strategy(env: AuthEnv): Auth0Strategy<User> {
  const authenticator = getAuthenticator(env);
  return authenticator.get<Auth0Strategy<User>>("auth0")!;
}

/**
 * Server auth context for making authenticated API requests.
 */
export type ServerAuthContext = {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
};

/**
 * Get auth context from request session.
 * Returns user data and access token if authenticated.
 */
export async function getServerAuthContext(
  request: Request,
  env: Pick<AuthEnv, "AUTH_SESSION_SECRET">
): Promise<ServerAuthContext> {
  const sessionStorage = getSessionStorage(env);
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return {
      isAuthenticated: false,
      accessToken: null,
      user: null,
    };
  }

  // Check if token is expired
  if (user.expiresAt && Date.now() > user.expiresAt) {
    return {
      isAuthenticated: false,
      accessToken: null,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    accessToken: user.accessToken,
    user,
  };
}

/**
 * Make an authenticated fetch request from the server.
 */
export async function serverAuthenticatedFetch(
  url: string,
  authContext: ServerAuthContext,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (authContext.isAuthenticated && authContext.accessToken) {
    headers.set("Authorization", buildAuthorizationHeader(authContext.accessToken));
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Creates a fetch function pre-configured with auth context.
 */
export async function createAuthenticatedFetch(
  request: Request,
  env: Pick<AuthEnv, "AUTH_SESSION_SECRET">
): Promise<(url: string, init?: RequestInit) => Promise<Response>> {
  const authContext = await getServerAuthContext(request, env);

  return (url: string, init?: RequestInit) =>
    serverAuthenticatedFetch(url, authContext, init);
}
