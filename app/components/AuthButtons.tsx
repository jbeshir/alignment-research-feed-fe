import { Form, Link } from "@remix-run/react";
import { useAuth } from "~/root";
import { Button } from "./ui/Button";

/**
 * Authentication buttons that use server-side auth routes.
 *
 * Login/Signup: Link to /auth/login (redirects to Auth0)
 * Logout: Form POST to /auth/logout (clears session, redirects to Auth0 logout)
 */
export function AuthButtons() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Form action="/auth/logout" method="post">
        <Button type="submit" variant="outline">
          Log Out
        </Button>
      </Form>
    );
  }

  return (
    <div className="flex gap-2">
      <Link to="/auth/login">
        <Button variant="outline" type="button">
          Log In
        </Button>
      </Link>
      <Link to="/auth/login?screen_hint=signup">
        <Button variant="primary" type="button">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
