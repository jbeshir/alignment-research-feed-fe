import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "./auth.server";
import { parseArticlesResponse, type Article } from "~/schemas/article";

type CloudflareEnv = {
  ALIGNMENT_FEED_BASE_URL: string;
  AUTH_SESSION_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_DEFAULT_REDIRECT_URI: string;
  AUTH0_AUDIENCE: string;
};

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

type FetchArticlesResult = {
  articles: Article[];
  isAuthenticated: boolean;
};

/**
 * Fetches articles from the backend API with standardized error handling.
 * Always returns { articles, isAuthenticated }.
 */
export async function fetchArticlesFromApi(
  request: Request,
  env: CloudflareEnv,
  options: FetchArticlesOptions
): Promise<ReturnType<typeof json<FetchArticlesResult>>> {
  const { endpoint, params, requireAuth = false, label = "articles" } = options;

  const { isAuthenticated, authFetch } = await createAuthenticatedFetch(
    request,
    env
  );

  // For auth-required endpoints, return early if not authenticated
  if (requireAuth && !isAuthenticated) {
    return json({ articles: [], isAuthenticated: false });
  }

  const apiBaseURL = env.ALIGNMENT_FEED_BASE_URL;
  const url = params
    ? `${apiBaseURL}${endpoint}?${params}`
    : `${apiBaseURL}${endpoint}`;

  try {
    const response = await authFetch(url);

    // For auth-required endpoints, check for 401 as fallback
    if (requireAuth && response.status === 401) {
      return json({ articles: [], isAuthenticated: false });
    }

    if (!response.ok) {
      console.error(`Failed to fetch ${label}:`, response.status);
      return json({ articles: [], isAuthenticated });
    }

    const result = parseArticlesResponse(await response.json());

    if (!result.success) {
      console.error(`Failed to parse ${label}:`, result.error);
      return json({ articles: [], isAuthenticated });
    }

    return json({ articles: result.data.data, isAuthenticated });
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    return json({ articles: [], isAuthenticated });
  }
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
