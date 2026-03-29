import { describe, it, expect, vi } from "vitest";
import { createChatTools } from "./chat-tools.server";

function createMockContext(options?: { isAuthenticated?: boolean }) {
  const authFetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
  return {
    ctx: {
      authFetch: authFetch as unknown as (
        url: string,
        init?: RequestInit
      ) => Promise<Response>,
      apiBaseURL: "https://api.example.com",
      isAuthenticated: options?.isAuthenticated ?? false,
    },
    authFetch,
  };
}

const execOpts = {
  toolCallId: "test",
  abortSignal: new AbortController().signal,
  messages: [],
};

describe("createChatTools", () => {
  it("returns all 8 tools", () => {
    const { ctx } = createMockContext();
    const tools = createChatTools(ctx);
    const toolNames = Object.keys(tools);
    expect(toolNames).toHaveLength(8);
    expect(toolNames).toContain("search_articles");
    expect(toolNames).toContain("semantic_search");
    expect(toolNames).toContain("get_article");
    expect(toolNames).toContain("get_similar_articles");
    expect(toolNames).toContain("get_recommendations");
    expect(toolNames).toContain("list_liked");
    expect(toolNames).toContain("list_disliked");
    expect(toolNames).toContain("list_unreviewed");
  });

  it("each tool has a description and inputSchema", () => {
    const { ctx } = createMockContext();
    const tools = createChatTools(ctx);
    for (const [, t] of Object.entries(tools)) {
      expect(t.description).toBeTruthy();
      expect(t.inputSchema).toBeTruthy();
    }
  });

  it("search_articles calls correct API endpoint", async () => {
    const { ctx, authFetch } = createMockContext();
    authFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );

    const tools = createChatTools(ctx);
    await tools.search_articles.execute!(
      { query: "interpretability" },
      execOpts
    );

    expect(authFetch).toHaveBeenCalledOnce();
    const calledUrl = String(authFetch.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("/v1/articles?");
    expect(calledUrl).toContain("filter_title_fulltext=interpretability");
  });

  it("auth-required tools return error when not authenticated", async () => {
    const { ctx } = createMockContext({ isAuthenticated: false });
    const tools = createChatTools(ctx);
    const result = await tools.get_recommendations.execute!({}, execOpts);
    expect(result).toEqual({ error: expect.stringContaining("logged in") });
  });

  it("auth-required tools call API when authenticated", async () => {
    const { ctx, authFetch } = createMockContext({ isAuthenticated: true });
    authFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );

    const tools = createChatTools(ctx);
    await tools.get_recommendations.execute!({ limit: 5 }, execOpts);

    expect(authFetch).toHaveBeenCalledOnce();
    const calledUrl = String(authFetch.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("/v1/articles/recommended?limit=5");
  });
});
