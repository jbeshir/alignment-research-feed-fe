import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Proxy route for /v1/articles/recommended API endpoint.
 * Handles client-side recommended article fetches by forwarding to the API with auth.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const apiUrl = `${apiBaseURL}/v1/articles/recommended`;

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
