import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Proxy route for /v1/articles/disliked API endpoint.
 * Handles client-side disliked article fetches by forwarding to the API with auth.
 * Supports pagination via page and page_size query parameters.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const url = new URL(request.url);
  const params = new URLSearchParams();

  // Forward pagination params
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("page_size");
  if (page) params.set("page", page);
  if (pageSize) params.set("page_size", pageSize);

  const apiUrl = `${apiBaseURL}/v1/articles/disliked?${params}`;

  const { authFetch } = await createAuthenticatedFetch(
    request,
    context.cloudflare.env
  );

  const response = await authFetch(apiUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
  });
}
