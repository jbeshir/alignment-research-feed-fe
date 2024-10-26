import { useAuth0 } from "@auth0/auth0-react";

export default function LoginLogoutButton() {
    const { isAuthenticated, loginWithRedirect, logout  } = useAuth0();
    if (isAuthenticated) {
        return <button onClick={() => logout()}>Logout</button>;
    } else {
        return <button onClick={() => loginWithRedirect()}>Log In / Register</button>;
    }
}