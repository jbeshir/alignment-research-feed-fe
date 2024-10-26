import { useAuth0 } from "@auth0/auth0-react";
import Button from "~/components/Button";

export default function LoginLogoutButton() {
    const { isLoading, isAuthenticated, loginWithRedirect, logout  } = useAuth0();
    if (isLoading) {
        return null;
    }
    if (isAuthenticated) {
        return <Button onClick={() => logout()}>Logout</Button>;
    } else {
        return <Button onClick={() => loginWithRedirect()}>Log In / Register</Button>;
    }
}