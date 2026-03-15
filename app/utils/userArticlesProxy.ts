import type { AppLoadContext } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Factory for paginated user-article proxy loaders (liked, disliked, unreviewed).
 * Handles auth, query parameter forwarding, and Set-Cookie passthrough on token refresh.
 */
export function makeUserArticlesProxyLoader(path: string) {
  return async function loader({
    request,
    context,
  }: {
    request: Request;
    context: AppLoadContext;
  }) {
    const {
      authFetch,
      isAuthenticated,
      headers: authHeaders,
    } = await createAuthenticatedFetch(request, context);

    if (!isAuthenticated) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
    const url = new URL(request.url);
    const apiUrl = `${apiBaseURL}${path}?${url.searchParams}`;

    const response = await authFetch(apiUrl);

    const responseHeaders = new Headers({
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    });

    if (authHeaders?.get("Set-Cookie")) {
      responseHeaders.set("Set-Cookie", authHeaders.get("Set-Cookie")!);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  };
}
