/**
 * Authentication constants shared across client and server.
 */

/**
 * Prefix added to Auth0 tokens when sending to the backend API.
 * The backend expects tokens in the format: "auth0|<token>"
 */
export const AUTH0_TOKEN_PREFIX = "auth0|";

/**
 * Builds an Authorization header value with the auth0 prefix.
 * @param accessToken - The Auth0 access token
 * @returns The full Authorization header value (e.g., "Bearer auth0|token123")
 */
export function buildAuthorizationHeader(accessToken: string): string {
  return `Bearer ${AUTH0_TOKEN_PREFIX}${accessToken}`;
}
