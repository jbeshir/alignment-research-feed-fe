import { describe, it, expect } from "vitest";
import {
  buildAuthorizationHeader,
  SESSION_MAX_AGE_SECONDS,
  TOKEN_REFRESH_THRESHOLD_MS,
  DEFAULT_TOKEN_EXPIRY_SECONDS,
} from "./auth";

describe("auth constants", () => {
  it("buildAuthorizationHeader returns correct format", () => {
    expect(buildAuthorizationHeader("mytoken123")).toBe(
      "Bearer auth0|mytoken123"
    );
  });

  it("SESSION_MAX_AGE_SECONDS is a positive number", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBeGreaterThan(0);
  });

  it("TOKEN_REFRESH_THRESHOLD_MS is a positive number", () => {
    expect(TOKEN_REFRESH_THRESHOLD_MS).toBeGreaterThan(0);
  });

  it("DEFAULT_TOKEN_EXPIRY_SECONDS is a positive number", () => {
    expect(DEFAULT_TOKEN_EXPIRY_SECONDS).toBeGreaterThan(0);
  });
});
