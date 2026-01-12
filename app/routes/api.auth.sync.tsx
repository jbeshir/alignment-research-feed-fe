import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  createAuthSessionCookie,
  destroyAuthSessionCookie,
} from "~/services/session.server";

/**
 * Resource route for syncing Auth0 tokens to server-side cookies.
 *
 * This route is called by the AuthTokenSync client component to:
 * - Store the access token in a secure HTTP-only cookie on login
 * - Clear the cookie on logout
 *
 * The cookie is then used by Remix loaders to make authenticated API requests.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const sessionSecret = context.cloudflare.env.AUTH_SESSION_SECRET;

  if (!sessionSecret) {
    console.error("AUTH_SESSION_SECRET is not configured");
    return json({ error: "Server configuration error" }, { status: 500 });
  }

  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType === "logout") {
    const cookie = await destroyAuthSessionCookie(sessionSecret);
    return json(
      { success: true },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  }

  if (actionType === "login") {
    const accessToken = formData.get("accessToken");

    if (typeof accessToken !== "string" || !accessToken) {
      return json({ error: "Missing access token" }, { status: 400 });
    }

    // Set expiration to 24 hours from now (typical Auth0 token lifetime)
    // In a production app, you might want to decode the JWT to get the actual expiration
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const cookie = await createAuthSessionCookie(
      { accessToken, expiresAt },
      sessionSecret
    );

    return json(
      { success: true },
      {
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  }

  return json({ error: "Invalid action" }, { status: 400 });
}
