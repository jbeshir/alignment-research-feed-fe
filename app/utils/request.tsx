import {Auth0ContextInterface} from "@auth0/auth0-react";

export async function AuthenticatedFetch(req : Request, auth0Context: Auth0ContextInterface) : Promise<Response|null> {
    const { isLoading, isAuthenticated, getAccessTokenSilently } = auth0Context;
    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        const accessToken = await getAccessTokenSilently();
        if (accessToken) {
            req.headers.set('Authorization', `Bearer auth0|${accessToken}`);
        }
    }

    return await fetch(req, {
        credentials: "omit",
        mode: "cors",
    });
}