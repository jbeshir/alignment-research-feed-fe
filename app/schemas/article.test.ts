import { describe, it, expect } from "vitest";
import {
  ArticleSchema,
  ArticlesResponseSchema,
  parseArticlesResponse,
} from "./article";

const validArticle = {
  hash_id: "abc123",
  title: "Test Article",
  link: "https://example.com/article",
  text_start: "This is the beginning of the article...",
  authors: "John Doe",
  source: "arxiv",
  published_at: "2024-01-15T12:00:00Z",
};

const validArticleWithOptionals = {
  ...validArticle,
  have_read: true,
  thumbs_up: false,
  thumbs_down: null,
};

describe("ArticleSchema", () => {
  it("parses valid article", () => {
    const result = ArticleSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hash_id).toBe("abc123");
      expect(result.data.title).toBe("Test Article");
    }
  });

  it("parses article with optional fields", () => {
    const result = ArticleSchema.safeParse(validArticleWithOptionals);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.have_read).toBe(true);
      expect(result.data.thumbs_up).toBe(false);
      expect(result.data.thumbs_down).toBeNull();
    }
  });

  it("rejects article with missing required fields", () => {
    const result = ArticleSchema.safeParse({
      hash_id: "abc123",
      // missing other required fields
    });
    expect(result.success).toBe(false);
  });

  it("rejects article with invalid URL", () => {
    const result = ArticleSchema.safeParse({
      ...validArticle,
      link: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("ArticlesResponseSchema", () => {
  it("parses valid response", () => {
    const result = ArticlesResponseSchema.safeParse({
      data: [validArticle],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(1);
    }
  });

  it("parses response with metadata", () => {
    const result = ArticlesResponseSchema.safeParse({
      data: [validArticle],
      metadata: { total: 100, page: 1 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.total).toBe(100);
    }
  });

  it("parses empty response", () => {
    const result = ArticlesResponseSchema.safeParse({
      data: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(0);
    }
  });
});

describe("parseArticlesResponse", () => {
  it("returns success with valid data", () => {
    const result = parseArticlesResponse({
      data: [validArticle],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(1);
    }
  });

  it("returns failure with error for invalid data", () => {
    const result = parseArticlesResponse({
      data: [{ invalid: true }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});
