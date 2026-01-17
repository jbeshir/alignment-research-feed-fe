import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/server/auth.server";

/**
 * Login route - redirects to Auth0 for authentication.
 *
 * Supports query parameters:
 * - screen_hint=signup: Show signup form instead of login
 * - returnTo: URL to redirect to after successful authentication
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const authenticator = getAuthenticator(env);

  // The authenticate method will redirect to Auth0
  return authenticator.authenticate("auth0", request);
}
