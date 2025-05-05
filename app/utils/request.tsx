import {Auth0ContextInterface} from "@auth0/auth0-react";

export async function AuthenticatedFetch(req : Request, auth0Context: Auth0ContextInterface) : Promise<Response|null> {
    const { isLoading, isAuthenticated, getAccessTokenSilently, logout } = auth0Context;
    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        try {
            const accessToken = await getAccessTokenSilently();
            if (accessToken) {
                req.headers.set('Authorization', `Bearer auth0|${accessToken}`);
            }
        } catch (e) {
            await logout();
            return null;
        }
    }

    return await fetch(req, {
        credentials: "omit",
        mode: "cors",
    });
}