import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observerInstance = useRef<IntersectionObserver | null>(null);

  // Store callback in ref to avoid recreating observer
  const callbackRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);

  // Keep refs in sync
  useEffect(() => {
    callbackRef.current = onLoadMore;
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
  }, [onLoadMore, hasMore, isLoading]);

  // Create observer once on mount
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
        callbackRef.current();
      }
    };

    observerInstance.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    // If element already mounted, observe it
    if (observerRef.current) {
      observerInstance.current.observe(observerRef.current);
    }

    return () => {
      if (observerInstance.current) {
        observerInstance.current.disconnect();
        observerInstance.current = null;
      }
    };
  }, [threshold, rootMargin]);

  // Callback ref handles element mounting/unmounting
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    // Unobserve previous element
    if (observerRef.current && observerInstance.current) {
      observerInstance.current.unobserve(observerRef.current);
    }

    observerRef.current = node;

    // Observe new element
    if (node && observerInstance.current) {
      observerInstance.current.observe(node);
    }
  }, []);

  return { sentinelRef };
}
