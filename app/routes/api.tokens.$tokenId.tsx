import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createAuthenticatedFetch } from "~/server/auth.server";

/**
 * Proxy route for /v1/tokens/:tokenId API endpoint.
 *
 * DELETE /api/tokens/:tokenId - Delete/revoke a token
 */

export async function action({ request, params, context }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const tokenId = params.tokenId;
  if (!tokenId) {
    return json({ error: "Token ID required" }, { status: 400 });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const apiUrl = `${apiBaseURL}/v1/tokens/${encodeURIComponent(tokenId)}`;

  const { authFetch, isAuthenticated } = await createAuthenticatedFetch(
    request,
    context.cloudflare.env
  );

  if (!isAuthenticated) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = await authFetch(apiUrl, { method: "DELETE" });

  if (!response.ok) {
    return json(
      { error: "Failed to delete token" },
      { status: response.status }
    );
  }

  return json({ success: true });
}
