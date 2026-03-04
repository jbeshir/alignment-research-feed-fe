import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserArticles } from "./useUserArticles";
import { mockArticle } from "~/test/helpers";

vi.mock("@remix-run/react", () => ({
  useRevalidator: () => ({ state: "idle" }),
}));

function makeResponse(articles: unknown[]) {
  return {
    ok: true,
    json: () => Promise.resolve({ data: articles }),
  };
}

describe("useUserArticles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches from /api/articles/{status}", async () => {
    const article = mockArticle({ hash_id: "u1" });
    const mockFetch = vi.fn().mockResolvedValue(makeResponse([article]));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useUserArticles("liked"));
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/articles/liked?");
  });

  it("handles 401 as Authentication required", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 })
    );

    const { result } = renderHook(() => useUserArticles("unreviewed"));
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Authentication required");
    });
  });

  it("pagination via loadMore", async () => {
    const initial = Array.from({ length: 20 }, (_, i) =>
      mockArticle({ hash_id: `init-${i}` })
    );
    const nextPage = [mockArticle({ hash_id: "next-1" })];
    const mockFetch = vi.fn().mockResolvedValue(makeResponse(nextPage));
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() =>
      useUserArticles("liked", { initialArticles: initial, pageSize: 20 })
    );

    expect(result.current.articles).toHaveLength(20);

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.articles.length).toBeGreaterThan(20);
    });
  });

  it("exposes setArticles for external updates", () => {
    const { result } = renderHook(() => useUserArticles("unreviewed"));
    expect(typeof result.current.setArticles).toBe("function");
  });
});
