import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Proxy route for semantic search.
 *
 * POST /api/articles/semantic-search
 * Body: { text: string, limit?: number }
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;

  let body: { text: string; limit?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const { authFetch } = await createAuthenticatedFetch(request, context);

  const response = await authFetch(
    `${apiBaseURL}/v1/articles/semantic-search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    return json(
      { error: errorBody || "Semantic search failed" },
      { status: response.status }
    );
  }

  return json(await response.json());
}
