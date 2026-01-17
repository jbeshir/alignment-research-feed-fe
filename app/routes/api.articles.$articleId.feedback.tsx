import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/services/auth.server";

/**
 * Proxy route for article feedback actions (thumbs up/down, mark as read).
 *
 * POST /api/articles/:articleId/feedback
 * Body: { action: "thumbs_up" | "thumbs_down" | "read", value: boolean }
 */
export async function action({ request, params, context }: ActionFunctionArgs) {
  const articleId = params.articleId;
  if (!articleId) {
    return json({ error: "Article ID required" }, { status: 400 });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;

  // Parse the action from the request body
  let body: { action: string; value: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action: feedbackAction, value } = body;

  // Map action to API endpoint
  let endpoint: string;
  switch (feedbackAction) {
    case "thumbs_up":
      endpoint = `thumbs_up/${value}`;
      break;
    case "thumbs_down":
      endpoint = `thumbs_down/${value}`;
      break;
    case "read":
      endpoint = `read/${value}`;
      break;
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }

  const apiUrl = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleId)}/${endpoint}`;

  const authFetch = await createAuthenticatedFetch(
    request,
    context.cloudflare.env
  );

  const response = await authFetch(apiUrl, { method: "POST" });

  if (!response.ok) {
    return json(
      { error: "Failed to update feedback" },
      { status: response.status }
    );
  }

  return json({ success: true });
}
