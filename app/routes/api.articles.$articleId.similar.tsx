import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Proxy route for /v1/articles/:articleId/similar API endpoint.
 * Handles client-side similar article fetches by forwarding to the API with auth.
 */
export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const articleId = params.articleId;
  if (!articleId) {
    return new Response(JSON.stringify({ error: "Article ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const apiUrl = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleId)}/similar`;

  const { authFetch } = await createAuthenticatedFetch(request, context);

  const response = await authFetch(apiUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
  });
}
