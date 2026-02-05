import { type PlatformProxy } from "wrangler";
import type { Env } from "./worker-configuration";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

/**
 * Per-request auth cache to ensure all loaders share the same auth result.
 * This prevents multiple refresh attempts with single-use refresh tokens
 * when Remix runs loaders in parallel.
 */
export type AuthCache = {
  authContextPromise?: Promise<unknown>;
};

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    authCache: AuthCache;
  }
}
