import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFeedback } from "./useFeedback";

describe("useFeedback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("setThumbsUp POSTs to correct URL with correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.setThumbsUp("article-1", true);

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-1/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "thumbs_up", value: true }),
    });
  });

  it("setThumbsDown POSTs to correct URL with correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.setThumbsDown("article-2", false);

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-2/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "thumbs_down", value: false }),
    });
  });

  it("markAsRead POSTs to correct URL with correct body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const { result } = renderHook(() => useFeedback());
    await result.current.markAsRead("article-3");

    expect(mockFetch).toHaveBeenCalledWith("/api/articles/article-3/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", value: true }),
    });
  });

  it("throws on non-OK response (setThumbsUp)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const { result } = renderHook(() => useFeedback());
    await expect(result.current.setThumbsUp("article-1", true)).rejects.toThrow(
      "Failed to update thumbs up"
    );
  });

  it("throws on non-OK response (setThumbsDown)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const { result } = renderHook(() => useFeedback());
    await expect(
      result.current.setThumbsDown("article-1", true)
    ).rejects.toThrow("Failed to update thumbs down");
  });

  it("throws on non-OK response (markAsRead)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const { result } = renderHook(() => useFeedback());
    await expect(result.current.markAsRead("article-1")).rejects.toThrow(
      "Failed to mark as read"
    );
  });
});
