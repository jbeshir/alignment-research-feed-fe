import { z } from "zod";

export const ArticleSchema = z.object({
  hash_id: z.string(),
  title: z.string(),
  link: z.string().url(),
  text_start: z.string(),
  authors: z.string(),
  source: z.string(),
  published_at: z.string().nullable(),
  summary: z.string().optional().nullable(),
  key_points: z.array(z.string()).optional().nullable(),
  implication: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  have_read: z.boolean().optional().nullable(),
  thumbs_up: z.boolean().optional().nullable(),
  thumbs_down: z.boolean().optional().nullable(),
});

export type Article = z.infer<typeof ArticleSchema>;

export const ArticlesResponseSchema = z.object({
  data: z.array(ArticleSchema),
  metadata: z.record(z.unknown()).optional(),
});

type ArticlesResponse = z.infer<typeof ArticlesResponseSchema>;

// Discriminated union for parse results
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Safely parse articles response with discriminated union result.
 * Callers should check success and handle errors appropriately.
 */
export function parseArticlesResponse(
  data: unknown
): ParseResult<ArticlesResponse> {
  const result = ArticlesResponseSchema.safeParse(data);
  if (!result.success) {
    console.error("Failed to parse articles response:", result.error);
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

/**
 * Format an author list into a compact byline for tight slots.
 *
 * Long lists are collapsed to "First Author +N others" so a truncated
 * byline never falls mid-surname. Lists with `maxNames` or fewer authors
 * are returned unchanged.
 */
export function formatAuthorsByline(authors: string, maxNames = 1): string {
  if (!authors) return authors;
  const names = authors
    .split(/,|\band\b/)
    .map(name => name.trim())
    .filter(Boolean);
  if (names.length <= maxNames) return authors;
  const shown = names.slice(0, maxNames).join(", ");
  const remaining = names.length - maxNames;
  return `${shown} +${remaining} other${remaining === 1 ? "" : "s"}`;
}

// Re-export formatting utility for convenience
export { formatPublishedDate } from "~/utils/formatting";
