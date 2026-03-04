import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useArticles } from "./useArticles";
import { mockArticle } from "~/test/helpers";

vi.mock("@remix-run/react", () => ({
  useRevalidator: () => ({ state: "idle" }),
}));

function makeResponse(articles: unknown[], metadata = {}) {
  return {
    ok: true,
    json: () => Promise.resolve({ data: articles, metadata }),
  };
}

function makeRawArticle(overrides: Record<string, unknown> = {}) {
  const a = mockArticle(overrides as Parameters<typeof mockArticle>[0]);
  return a;
}

describe("useArticles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initial state: has initialArticles, not loading", () => {
    const articles = [makeRawArticle({ hash_id: "1" })];
    const { result } = renderHook(() =>
      useArticles("", { initialArticles: articles })
    );
    expect(result.current.articles).toEqual(articles);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetches from /api/articles with correct query params", async () => {
    const fetchedArticle = makeRawArticle({ hash_id: "fetched" });
    const mockFetch = vi.fn().mockResolvedValue(makeResponse([fetchedArticle]));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useArticles(""));

    // Trigger a refetch since no initial articles
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/articles?");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("page_size=20");
    expect(calledUrl).toContain("sort=published_at_desc");
  });

  it("appends articles on loadMore", async () => {
    const initial = Array.from({ length: 20 }, (_, i) =>
      makeRawArticle({ hash_id: `init-${i}` })
    );
    const nextPage = [makeRawArticle({ hash_id: "next-1" })];
    const mockFetch = vi.fn().mockResolvedValue(makeResponse(nextPage));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() =>
      useArticles("", { initialArticles: initial, pageSize: 20 })
    );

    expect(result.current.articles).toHaveLength(20);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.articles.length).toBeGreaterThan(20);
    });
  });

  it("resets and re-fetches on search query change", async () => {
    const searchResult = makeRawArticle({ hash_id: "search-result" });
    const mockFetch = vi.fn().mockResolvedValue(makeResponse([searchResult]));
    vi.stubGlobal("fetch", mockFetch);

    const { rerender } = renderHook(
      ({ query }) => useArticles(query, { initialArticles: [] }),
      { initialProps: { query: "" } }
    );

    rerender({ query: "alignment" });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("filter_title_fulltext=alignment");
  });

  it("handles fetch errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const { result } = renderHook(() => useArticles(""));
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("exposes setArticles for external updates", () => {
    const { result } = renderHook(() => useArticles(""));
    expect(typeof result.current.setArticles).toBe("function");
  });
});
