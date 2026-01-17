import { getAuth0Strategy, type AuthEnv, type User } from "./auth.server";

/**
 * Refresh the access token using the refresh token.
 *
 * Uses the Auth0Strategy's built-in refreshToken method which handles
 * the OAuth2 token refresh flow including rotation if configured.
 *
 * @param refreshToken The refresh token to use
 * @param env The environment with Auth0 configuration
 * @returns Updated user data with new tokens, or null if refresh failed
 */
export async function refreshAccessToken(
  refreshToken: string,
  env: AuthEnv
): Promise<Omit<User, "id" | "email"> | null> {
  try {
    const strategy = getAuth0Strategy(env);
    const tokens = await strategy.refreshToken(refreshToken);

    return {
      accessToken: tokens.accessToken(),
      refreshToken: tokens.refreshToken() ?? refreshToken,
      expiresAt: Date.now() + (tokens.accessTokenExpiresInSeconds() ?? 86400) * 1000,
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return null;
  }
}

/**
 * Time before expiry when we should refresh the token (5 minutes).
 */
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Check if a token needs refreshing.
 */
export function shouldRefreshToken(expiresAt: number): boolean {
  return Date.now() > expiresAt - TOKEN_REFRESH_THRESHOLD_MS;
}
