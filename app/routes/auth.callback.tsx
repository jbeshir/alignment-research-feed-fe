import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getAuthenticator, getSessionStorage } from "~/server/auth.server";

/**
 * Auth callback route - handles the OAuth redirect from Auth0.
 *
 * After Auth0 authenticates the user, it redirects here with an
 * authorization code. This route exchanges the code for tokens
 * and creates a session.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const authenticator = getAuthenticator(env);
  const sessionStorage = getSessionStorage(env);

  try {
    // Authenticate will exchange the code for tokens and call our verify function
    const user = await authenticator.authenticate("auth0", request);

    // Create session with user data
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    session.set("user", user);

    // Redirect to home page with the session cookie
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    console.error("Authentication callback error:", error);

    // On error, redirect to home page
    // Could also redirect to an error page or show the error
    return redirect("/");
  }
}
