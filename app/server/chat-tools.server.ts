/**
 * Vercel AI SDK tool definitions mirroring the MCP server tools.
 * Each tool calls the Go backend API via a provided fetch function.
 */
import { tool } from "ai";
import { z } from "zod";

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

type ToolContext = {
  authFetch: AuthFetch;
  apiBaseURL: string;
  isAuthenticated: boolean;
};

async function fetchJSON(
  ctx: ToolContext,
  url: string,
  init?: RequestInit
): Promise<unknown> {
  const response = await ctx.authFetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error (${response.status}): ${body}`);
  }
  return response.json();
}

function requireAuth(ctx: ToolContext): string | null {
  if (!ctx.isAuthenticated) {
    return "You need to be logged in to use this feature. Please log in first.";
  }
  return null;
}

export function createChatTools(ctx: ToolContext) {
  return {
    search_articles: tool({
      description:
        "Search alignment research articles by keyword, source, or date range. " +
        "Returns articles sorted by publication date (newest first by default).",
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe("Search query to match in article titles"),
        sources: z
          .string()
          .optional()
          .describe(
            "Comma-separated list of sources to include (e.g., 'arxiv,lesswrong')"
          ),
        exclude_sources: z
          .string()
          .optional()
          .describe("Comma-separated list of sources to exclude"),
        published_after: z
          .string()
          .optional()
          .describe(
            "Only include articles published after this date (RFC3339 format)"
          ),
        published_before: z
          .string()
          .optional()
          .describe(
            "Only include articles published before this date (RFC3339 format)"
          ),
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of articles to return (default: 20, max: 200)"
          ),
        page: z
          .number()
          .optional()
          .describe("Page number for pagination (1-indexed, default: 1)"),
        category: z
          .string()
          .optional()
          .describe(
            "Filter by category: Interpretability, Safety Techniques, Governance & Policy, " +
              "Deception & Misalignment, AI Capabilities & Behavior, Risks & Strategy, " +
              "Forecasting, AI & Society, Field Building, Other"
          ),
      }),
      execute: async args => {
        const params = new URLSearchParams();
        params.set("sort", "published_at_desc");
        if (args.query) params.set("filter_title_fulltext", args.query);
        if (args.sources) params.set("filter_sources_allowlist", args.sources);
        if (args.exclude_sources)
          params.set("filter_sources_blocklist", args.exclude_sources);
        if (args.published_after)
          params.set("filter_published_after", args.published_after);
        if (args.published_before)
          params.set("filter_published_before", args.published_before);
        if (args.limit)
          params.set("page_size", String(Math.min(args.limit, 200)));
        if (args.page) params.set("page", String(args.page));
        if (args.category) params.set("filter_category", args.category);

        const data = await fetchJSON(
          ctx,
          `${ctx.apiBaseURL}/v1/articles?${params}`
        );
        return data;
      },
    }),

    semantic_search: tool({
      description:
        "Search for articles semantically similar to the given text. " +
        "Useful for finding related research by providing a snippet, abstract, or topic description.",
      inputSchema: z.object({
        text: z
          .string()
          .describe(
            "The text to find semantically similar articles for (max 100KB)"
          ),
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of articles to return (default: 10, max: 100)"
          ),
      }),
      execute: async args => {
        const data = await fetchJSON(
          ctx,
          `${ctx.apiBaseURL}/v1/articles/semantic-search`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: args.text,
              limit: args.limit ? Math.min(args.limit, 100) : 10,
            }),
          }
        );
        return data;
      },
    }),

    get_article: tool({
      description:
        "Get full details of a specific article by its ID (hash_id). " +
        "Includes LLM-generated analysis when available: summary, key points, implication, and category.",
      inputSchema: z.object({
        article_id: z
          .string()
          .describe("The hash_id of the article to retrieve"),
      }),
      execute: async args => {
        const data = await fetchJSON(
          ctx,
          `${ctx.apiBaseURL}/v1/articles/${encodeURIComponent(args.article_id)}`
        );
        return data;
      },
    }),

    get_similar_articles: tool({
      description:
        "Find articles similar to a given article using vector similarity. " +
        "Useful for discovering related research.",
      inputSchema: z.object({
        article_id: z
          .string()
          .describe("The hash_id of the article to find similar articles for"),
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of similar articles to return (default: 10)"
          ),
      }),
      execute: async args => {
        const params = args.limit ? `?limit=${args.limit}` : "";
        const data = await fetchJSON(
          ctx,
          `${ctx.apiBaseURL}/v1/articles/${encodeURIComponent(args.article_id)}/similar${params}`
        );
        return data;
      },
    }),

    get_recommendations: tool({
      description:
        "Get personalized article recommendations based on rating history. Requires authentication.",
      inputSchema: z.object({
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of recommendations to return (default: 10)"
          ),
      }),
      execute: async args => {
        const authError = requireAuth(ctx);
        if (authError) return { error: authError };

        const params = args.limit ? `?limit=${args.limit}` : "";
        const data = await fetchJSON(
          ctx,
          `${ctx.apiBaseURL}/v1/articles/recommended${params}`
        );
        return data;
      },
    }),

    list_liked: paginatedListTool(
      ctx,
      "List articles marked as liked (thumbs up). Requires authentication.",
      "liked"
    ),

    list_disliked: paginatedListTool(
      ctx,
      "List articles marked as disliked (thumbs down). Requires authentication.",
      "disliked"
    ),

    list_unreviewed: paginatedListTool(
      ctx,
      "List articles not yet reviewed. Requires authentication.",
      "unreviewed"
    ),
  };
}

const paginatedListSchema = z.object({
  page: z.number().optional().describe("Page number (1-indexed, default: 1)"),
  page_size: z
    .number()
    .optional()
    .describe("Number of articles per page (default: 50, max: 200)"),
});

function paginatedListTool(
  ctx: ToolContext,
  description: string,
  path: string
) {
  return tool({
    description,
    inputSchema: paginatedListSchema,
    execute: async (args: z.infer<typeof paginatedListSchema>) => {
      const authError = requireAuth(ctx);
      if (authError) return { error: authError };

      const params = new URLSearchParams();
      if (args.page) params.set("page", String(args.page));
      if (args.page_size)
        params.set("page_size", String(Math.min(args.page_size, 200)));
      const data = await fetchJSON(
        ctx,
        `${ctx.apiBaseURL}/v1/articles/${path}?${params}`
      );
      return data;
    },
  });
}
