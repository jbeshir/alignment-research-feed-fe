import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { authFetch, isAuthenticated } = await createAuthenticatedFetch(
    request,
    context
  );

  if (!isAuthenticated) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const url = new URL(request.url);
  const apiUrl = `${apiBaseURL}/v1/articles/unreviewed?${url.searchParams}`;

  const response = await authFetch(apiUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
  });
}
