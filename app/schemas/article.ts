import { z } from "zod";

export const ArticleSchema = z.object({
  hash_id: z.string(),
  title: z.string(),
  link: z.string().url(),
  text_start: z.string(),
  authors: z.string(),
  source: z.string(),
  published_at: z.string(),
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

// Re-export formatting utility for convenience
export { formatPublishedDate } from "~/utils/formatting";
