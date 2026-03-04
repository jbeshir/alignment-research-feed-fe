import type { Article } from "~/schemas/article";

/**
 * Factory returning a valid Article object for tests.
 */
export function mockArticle(overrides?: Partial<Article>): Article {
  return {
    hash_id: "abc123",
    title: "Test Article Title",
    link: "https://example.com/article",
    text_start: "This is the start of the article text...",
    authors: "Test Author",
    source: "arxiv",
    published_at: "2024-06-15T00:00:00Z",
    summary: "A test summary of the article.",
    key_points: ["Point 1", "Point 2"],
    implication: "Test implication",
    category: "Interpretability",
    have_read: false,
    thumbs_up: false,
    thumbs_down: false,
    ...overrides,
  };
}
