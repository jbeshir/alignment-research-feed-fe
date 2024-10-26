import { useAuth0 } from "@auth0/auth0-react";

export default function LoginLogoutButton() {
    const { isLoading, isAuthenticated, loginWithRedirect, logout  } = useAuth0();
    if (isLoading) {
        return null;
    }
    if (isAuthenticated) {
        return <button onClick={() => logout()}>Logout</button>;
    } else {
        return <button onClick={() => loginWithRedirect()}>Log In / Register</button>;
    }
}