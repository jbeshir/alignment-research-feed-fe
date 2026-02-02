import { json, defer, type AppLoadContext } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "./auth.server";
import { parseArticlesResponse, type Article } from "~/schemas/article";

type FetchArticlesOptions = {
  /** The API endpoint path (e.g., "/v1/articles/liked") */
  endpoint: string;
  /** Query parameters to include */
  params?: URLSearchParams;
  /** Whether authentication is required (returns early if not authenticated) */
  requireAuth?: boolean;
  /** Label for error messages */
  label?: string;
};

export type FetchArticlesResult = {
  articles: Article[];
  isAuthenticated: boolean;
};

/**
 * Internal function that performs the actual API fetch.
 * Returns the raw result without wrapping in json().
 */
async function fetchArticlesInternal(
  authFetch: (url: string, init?: RequestInit) => Promise<Response>,
  isAuthenticated: boolean,
  apiBaseURL: string,
  options: FetchArticlesOptions
): Promise<FetchArticlesResult> {
  const { endpoint, params, requireAuth = false, label = "articles" } = options;

  // For auth-required endpoints, return early if not authenticated
  if (requireAuth && !isAuthenticated) {
    return { articles: [], isAuthenticated: false };
  }

  const url = params
    ? `${apiBaseURL}${endpoint}?${params}`
    : `${apiBaseURL}${endpoint}`;

  try {
    const response = await authFetch(url);

    // For auth-required endpoints, check for 401 as fallback
    if (requireAuth && response.status === 401) {
      return { articles: [], isAuthenticated: false };
    }

    if (!response.ok) {
      console.error(`Failed to fetch ${label}:`, response.status);
      return { articles: [], isAuthenticated };
    }

    const result = parseArticlesResponse(await response.json());

    if (!result.success) {
      console.error(`Failed to parse ${label}:`, result.error);
      return { articles: [], isAuthenticated };
    }

    return { articles: result.data.data, isAuthenticated };
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    return { articles: [], isAuthenticated };
  }
}

/**
 * Fetches articles from the backend API with standardized error handling.
 * Always returns { articles, isAuthenticated }.
 */
export async function fetchArticlesFromApi(
  request: Request,
  context: AppLoadContext,
  options: FetchArticlesOptions
): Promise<ReturnType<typeof json<FetchArticlesResult>>> {
  const { isAuthenticated, authFetch, headers } =
    await createAuthenticatedFetch(request, context);
  const result = await fetchArticlesInternal(
    authFetch,
    isAuthenticated,
    context.cloudflare.env.ALIGNMENT_FEED_BASE_URL,
    options
  );
  return json(result, headers ? { headers } : undefined);
}

/**
 * Fetches articles using Remix's defer pattern for streaming responses.
 * Use with Suspense + Await on the client for immediate page shell rendering.
 *
 * Returns `isAuthenticated` synchronously so auth UI can render immediately,
 * while `articlesData` is deferred as a promise.
 */
export async function fetchArticlesDeferred(
  request: Request,
  context: AppLoadContext,
  options: FetchArticlesOptions
) {
  const { requireAuth = false } = options;

  // Check auth synchronously so we can show login prompt immediately
  const { isAuthenticated, authFetch, headers } =
    await createAuthenticatedFetch(request, context);

  if (requireAuth && !isAuthenticated) {
    // Return immediately resolved promise for unauthenticated case
    return defer(
      {
        isAuthenticated: false,
        articlesData: Promise.resolve({ articles: [], isAuthenticated: false }),
      },
      headers ? { headers } : undefined
    );
  }

  // Defer the actual fetch so page renders immediately
  const articlesPromise = fetchArticlesInternal(
    authFetch,
    isAuthenticated,
    context.cloudflare.env.ALIGNMENT_FEED_BASE_URL,
    options
  );
  return defer(
    { isAuthenticated: true, articlesData: articlesPromise },
    headers ? { headers } : undefined
  );
}

/**
 * Creates standard pagination params for article list endpoints.
 */
export function createPaginationParams(
  page: number = 1,
  pageSize: number = 20
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("page_size", pageSize.toString());
  return params;
}
