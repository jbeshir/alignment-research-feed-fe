import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const articleId = params.articleId;
  if (!articleId) {
    return json({ error: "Article ID is required" }, { status: 400 });
  }

  const { authFetch, isAuthenticated } = await createAuthenticatedFetch(
    request,
    context
  );

  if (!isAuthenticated) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const apiUrl = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleId)}/similar`;

  const response = await authFetch(apiUrl);

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
  });
}
