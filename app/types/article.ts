import { z } from "zod";

/**
 * Article schema and type - the core data model for articles.
 */
export const Article = z.object({
  hash_id: z.string(),
  title: z.string(),
  link: z.string(),
  text_start: z.string(),
  authors: z.string(),
  source: z.string(),
  published_at: z.string().datetime().pipe(z.coerce.date()),
  have_read: z.boolean().optional(),
  thumbs_up: z.boolean().optional(),
  thumbs_down: z.boolean().optional(),
});

export type Article = z.infer<typeof Article>;

/**
 * Serialized article data for JSON transport.
 * Dates are serialized as ISO strings when passing through Remix's json().
 */
export type SerializedArticle = Omit<Article, "published_at"> & {
  published_at: string;
};

/**
 * Convert serialized article data back to Article type with proper Date objects.
 */
export function deserializeArticle(serialized: SerializedArticle): Article {
  return {
    ...serialized,
    published_at: new Date(serialized.published_at),
  };
}

/**
 * Serialize an Article for JSON transport (Date -> ISO string).
 */
export function serializeArticle(article: Article): SerializedArticle {
  return {
    ...article,
    published_at: article.published_at.toISOString(),
  };
}
