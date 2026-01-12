import { getAuthSession } from "./session.server";

/**
 * Server-side authentication utilities for making authenticated API requests
 * from Remix loaders and actions.
 */

export type ServerAuthContext = {
  isAuthenticated: boolean;
  accessToken: string | null;
};

/**
 * Get the server-side auth context from the request.
 * Use this in loaders/actions to check authentication status.
 */
export async function getServerAuthContext(
  request: Request,
  sessionSecret: string
): Promise<ServerAuthContext> {
  const session = await getAuthSession(request, sessionSecret);

  if (!session) {
    return {
      isAuthenticated: false,
      accessToken: null,
    };
  }

  return {
    isAuthenticated: true,
    accessToken: session.accessToken,
  };
}

/**
 * Make an authenticated fetch request from the server.
 * Automatically attaches the Authorization header if the user is authenticated.
 */
export async function serverAuthenticatedFetch(
  url: string,
  authContext: ServerAuthContext,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (authContext.isAuthenticated && authContext.accessToken) {
    headers.set("Authorization", `Bearer auth0|${authContext.accessToken}`);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Helper type for loader context that includes auth
 */
export type AuthenticatedLoaderArgs = {
  request: Request;
  params: Record<string, string | undefined>;
  context: {
    cloudflare: {
      env: {
        ALIGNMENT_FEED_BASE_URL: string;
        AUTH_SESSION_SECRET: string;
        AUTH0_DOMAIN: string;
        AUTH0_AUDIENCE: string;
        AUTH0_CLIENT_ID: string;
        AUTH0_DEFAULT_REDIRECT_URI: string;
      };
    };
  };
};

/**
 * Creates a fetch function pre-configured with auth context.
 * Useful for making multiple authenticated requests in a loader.
 *
 * @example
 * ```ts
 * export const loader = async ({ request, context }: LoaderFunctionArgs) => {
 *   const authFetch = await createAuthenticatedFetch(request, context);
 *   const article = await authFetch(`${apiBaseURL}/v1/articles/${id}`);
 *   return json({ article: await article.json() });
 * };
 * ```
 */
export async function createAuthenticatedFetch(
  request: Request,
  sessionSecret: string
): Promise<(url: string, init?: RequestInit) => Promise<Response>> {
  const authContext = await getServerAuthContext(request, sessionSecret);

  return (url: string, init?: RequestInit) =>
    serverAuthenticatedFetch(url, authContext, init);
}
