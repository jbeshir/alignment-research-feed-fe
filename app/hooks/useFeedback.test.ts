import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFeedback } from "./useFeedback";

describe("useFeedback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sendFeedback POSTs thumbs_up action correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.sendFeedback("article-1", "thumbs_up", true);

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-1/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "thumbs_up", value: true }),
    });
  });

  it("sendFeedback POSTs thumbs_down action correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.sendFeedback("article-2", "thumbs_down", false);

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-2/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "thumbs_down", value: false }),
    });
  });

  it("sendFeedback POSTs read action correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.sendFeedback("article-3", "read", true);

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-3/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", value: true }),
    });
  });

  it("throws with HTTP status on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const { result } = renderHook(() => useFeedback());
    await expect(
      result.current.sendFeedback("article-1", "thumbs_up", true)
    ).rejects.toThrow("Feedback request failed: 500");
  });
});
