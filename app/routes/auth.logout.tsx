import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getSessionStorage } from "~/server/auth.server";

/**
 * Logout route - clears the session and redirects to Auth0 logout.
 *
 * Uses POST to prevent CSRF attacks - logout should be triggered
 * by a form submission, not a link click.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const sessionStorage = getSessionStorage(env);
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));

  // Build Auth0 logout URL
  const logoutURL = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`);
  logoutURL.searchParams.set("client_id", env.AUTH0_CLIENT_ID);

  // Return to the app's origin after Auth0 logout
  const returnTo = new URL(request.url).origin;
  logoutURL.searchParams.set("returnTo", returnTo);

  // Clear the session and redirect to Auth0 logout
  return redirect(logoutURL.toString(), {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

/**
 * GET requests to /auth/logout should redirect to home.
 * Only POST requests perform the logout action.
 */
export async function loader() {
  return redirect("/");
}
