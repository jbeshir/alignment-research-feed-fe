// Prefix added to Auth0 tokens when sending to the backend API.
// The backend expects tokens in the format: "auth0|<token>"
const AUTH0_TOKEN_PREFIX = "auth0|";

// Session cookie duration in seconds (7 days).
// Token expiry is checked separately via shouldRefreshToken.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// How far before token expiry we proactively refresh (5 minutes).
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Fallback token expiry if Auth0 doesn't provide one (24 hours).
export const DEFAULT_TOKEN_EXPIRY_SECONDS = 86400;

export function buildAuthorizationHeader(accessToken: string): string {
  return `Bearer ${AUTH0_TOKEN_PREFIX}${accessToken}`;
}
