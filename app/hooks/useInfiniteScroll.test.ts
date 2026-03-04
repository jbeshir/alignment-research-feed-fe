import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInfiniteScroll } from "./useInfiniteScroll";

// Mock IntersectionObserver
let observerCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    })
  );
});

describe("useInfiniteScroll", () => {
  it("returns a sentinelRef callback", () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        isLoading: false,
      })
    );
    expect(typeof result.current.sentinelRef).toBe("function");
  });

  it("creates observer on mount and disconnects on unmount", () => {
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        isLoading: false,
      })
    );
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("calls onLoadMore when entry is intersecting and hasMore && !isLoading", () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    );

    // Simulate intersection
    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onLoadMore when isLoading is true", () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: true })
    );

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does NOT call onLoadMore when hasMore is false", () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: false, isLoading: false })
    );

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("observes element when sentinelRef is called with a node", () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        isLoading: false,
      })
    );

    const div = document.createElement("div");
    result.current.sentinelRef(div);
    expect(mockObserve).toHaveBeenCalledWith(div);
  });
});
