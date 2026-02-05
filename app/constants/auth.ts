/**
 * Authentication constants shared across client and server.
 */

/**
 * Prefix added to Auth0 tokens when sending to the backend API.
 * The backend expects tokens in the format: "auth0|<token>"
 */
const AUTH0_TOKEN_PREFIX = "auth0|";

/**
 * Session cookie duration in seconds (7 days).
 * Token expiry is checked separately.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Time before token expiry when we should refresh (5 minutes in ms).
 */
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Default token expiry time in seconds if not provided (24 hours).
 */
export const DEFAULT_TOKEN_EXPIRY_SECONDS = 86400;

/**
 * Builds an Authorization header value with the auth0 prefix.
 * @param accessToken - The Auth0 access token
 * @returns The full Authorization header value (e.g., "Bearer auth0|token123")
 */
export function buildAuthorizationHeader(accessToken: string): string {
  return `Bearer ${AUTH0_TOKEN_PREFIX}${accessToken}`;
}
